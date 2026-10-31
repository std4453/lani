import { QueueConsumer } from '@/background-queue/consumer.decorator';
import { QueueHandler, QueueJob } from '@/background-queue/types';
import config from '@/config';
import { Injectable } from '@nestjs/common';
import { TorrentMatchService } from './index.service';
import { CatalogSnapshot } from './protocol';
import { CATALOG_QUEUE, MATCH_QUEUE, TorrentMatchPayload } from './queues';

@Injectable()
@QueueConsumer(CATALOG_QUEUE)
export class MatchCatalogConsumer implements QueueHandler<CatalogSnapshot> {
  constructor(private matching: TorrentMatchService) {}

  get enabled() {
    return config.matching.enabled;
  }

  execute(job: QueueJob<CatalogSnapshot>) {
    return this.matching.configure(job);
  }

  settled() {
    this.matching.settleCatalog();
  }
}

@Injectable()
@QueueConsumer(MATCH_QUEUE)
export class TorrentMatchConsumer implements QueueHandler<TorrentMatchPayload> {
  readonly continueOnFailure = true;

  constructor(private matching: TorrentMatchService) {}

  get enabled() {
    return config.matching.enabled;
  }

  ready(job: QueueJob<TorrentMatchPayload>) {
    return this.matching.ready(job);
  }

  execute(job: QueueJob<TorrentMatchPayload>) {
    return this.matching.match(job);
  }

  settled() {
    this.matching.settleMatch();
  }
}
