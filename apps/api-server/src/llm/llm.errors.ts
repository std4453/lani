export class LlmError extends Error {
  constructor(readonly code: string, readonly retryable = true) {
    super(code);
    this.name = 'LlmError';
  }
}

export function describeLlmError(error: unknown, apiKey?: string): string {
  let detail: string;
  if (error instanceof Error) {
    detail = error.stack ?? error.message;
  } else {
    try {
      detail = JSON.stringify(error) ?? String(error);
    } catch {
      detail = String(error);
    }
  }
  if (apiKey) {
    // 对象日志可能先将引号、反斜杠等字符转义，需同时遮盖 JSON 形式。
    const forms = [apiKey, JSON.stringify(apiKey).slice(1, -1)];
    for (const form of forms.sort((a, b) => b.length - a.length)) {
      detail = detail.split(form).join('[REDACTED]');
    }
  }
  return detail;
}
