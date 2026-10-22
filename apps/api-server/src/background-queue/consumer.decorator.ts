import { SetMetadata } from '@nestjs/common';

export const QUEUE_CONSUMER = Symbol('QUEUE_CONSUMER');

/** 标记实现 QueueHandler<TPayload> 的单例 provider，由队列模块自动注册。 */
export const QueueConsumer = (name: string): ClassDecorator =>
  SetMetadata(QUEUE_CONSUMER, name);
