import { Injectable, OnModuleInit, Scope } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { QUEUE_CONSUMER } from './consumer.decorator';
import { BackgroundQueueService } from './index.service';
import { QueueHandler } from './types';

@Injectable()
export class QueueExplorer implements OnModuleInit {
  constructor(
    private discovery: DiscoveryService,
    private reflector: Reflector,
    private queue: BackgroundQueueService,
  ) {}

  onModuleInit() {
    for (const provider of this.discovery.getProviders()) {
      if (provider.isAlias || !provider.metatype) continue;
      const name = this.reflector.get<string>(
        QUEUE_CONSUMER,
        provider.metatype,
      );
      if (name === undefined) continue;
      if (
        !provider.isDependencyTreeStatic() ||
        provider.scope === Scope.TRANSIENT
      )
        throw new Error(`Queue consumer ${name} must be a singleton`);
      this.queue.register(name, provider.instance as QueueHandler<unknown>);
    }
  }
}
