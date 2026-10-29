import 'openai/shims/node';
import config from '@/config';
import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions';
import pLimit from 'p-limit';
import { describeLlmError, LlmError } from './llm.errors';

export interface LlmChannel {
  apiBase: string;
  apiKey: string;
}

@Injectable()
export class LlmService implements OnModuleDestroy {
  private readonly logger = new Logger(LlmService.name);
  private readonly limit = pLimit(config.llm?.concurrency ?? 2);
  private readonly clients = new Map<string, OpenAI>();
  private readonly pending = new Set<AbortController>();
  private closed = false;

  async complete(
    channel: LlmChannel,
    payload: Record<string, unknown>,
    signal?: AbortSignal,
  ): Promise<unknown> {
    if (this.closed || signal?.aborted) throw new LlmError('ABORTED', false);
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    this.pending.add(controller);
    try {
      // 排队期间也遵守调用方截止时间；取消后的队列项不会再发起付费请求。
      return await new Promise((resolve, reject) => {
        const cancelled = () => reject(new LlmError('ABORTED', false));
        controller.signal.addEventListener('abort', cancelled, { once: true });
        this.limit(async () => {
          if (controller.signal.aborted) throw new LlmError('ABORTED', false);
          return this.request(channel, payload, controller.signal);
        })
          .then(resolve, reject)
          .finally(() =>
            controller.signal.removeEventListener('abort', cancelled),
          );
      });
    } finally {
      signal?.removeEventListener('abort', abort);
      this.pending.delete(controller);
    }
  }

  onModuleDestroy() {
    this.closed = true;
    for (const controller of this.pending) controller.abort();
  }

  private client(channel: LlmChannel): OpenAI {
    const key = JSON.stringify([channel.apiBase, channel.apiKey]);
    let client = this.clients.get(key);
    if (!client) {
      client = new OpenAI({
        baseURL: channel.apiBase,
        apiKey: channel.apiKey,
        maxRetries: 0,
      });
      this.clients.set(key, client);
    }
    return client;
  }

  private async request(
    channel: LlmChannel,
    payload: Record<string, unknown>,
    signal: AbortSignal,
  ): Promise<unknown> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, { once: true });
    let timedOut = false;
    const timeout = config.llm?.timeoutMs ?? 45000;
    // SDK 的连接超时之外，将读取响应正文也纳入同一次请求的限时。
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, timeout);
    try {
      return await this.client(channel).chat.completions.create(
        payload as unknown as ChatCompletionCreateParamsNonStreaming,
        { signal: controller.signal, timeout },
      );
    } catch (error) {
      if (timedOut) throw new LlmError('TIMEOUT');
      if (signal.aborted) throw new LlmError('ABORTED', false);
      if (error instanceof OpenAI.APIConnectionTimeoutError)
        throw new LlmError('TIMEOUT');
      if (error instanceof OpenAI.APIError && error.status !== undefined) {
        const status = error.status;
        throw new LlmError(
          `HTTP_${status}`,
          [408, 409, 429].includes(status) || status >= 500,
        );
      }
      this.logger.error(
        `LLM request failed: ${describeLlmError(error, channel.apiKey)}`,
      );
      throw new LlmError('NETWORK_ERROR');
    } finally {
      clearTimeout(timer);
      signal.removeEventListener('abort', abort);
    }
  }
}
