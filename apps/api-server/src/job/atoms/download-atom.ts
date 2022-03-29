import { Atom } from '@/job/atoms';
import { QBittorrentService } from '@/job/qbt.service';
import { QBTTorrentState } from '@/job/types';
import { ConflictException, Injectable } from '@nestjs/common';
import { DownloadJob } from '@prisma/client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

type AtomRunReturnType = Awaited<ReturnType<Atom['run']>>;
interface PromiseRecord {
  promise: Promise<AtomRunReturnType>;
  resolve: (value?: AtomRunReturnType | PromiseLike<AtomRunReturnType>) => void;
  reject: (reason?: any) => void;
}

@Injectable()
export class DownloadAtom extends Atom {
  constructor(private qbt: QBittorrentService) {
    super();
    dayjs.extend(utc);
  }

  private jobPromiseMap: Record<number, PromiseRecord> = {};

  run(job: DownloadJob) {
    const record = this.jobPromiseMap[job.id];
    if (record) {
      return record.promise;
    }
    let resolve: PromiseRecord['resolve'] | undefined = undefined;
    let reject: PromiseRecord['resolve'] | undefined = undefined;
    const promise = new Promise<AtomRunReturnType>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    if (!resolve || !reject) {
      throw new Error();
    }
    this.jobPromiseMap[job.id] = {
      promise,
      resolve,
      reject,
    };
    return promise;
  }

  isTracked(job: DownloadJob) {
    return job.id in this.jobPromiseMap;
  }

  async refreshDownloadStatus({
    id,
    qbtTorrentHash,
    qbtLastSync,
  }: DownloadJob) {
    const record = this.jobPromiseMap[id];
    if (!record) {
      throw new ConflictException(`Job ${id} not tracked by DownloadAtom`);
    }
    if (!qbtTorrentHash) {
      throw new Error('qbtTorrentHash not set');
    }
    const torrent = await this.qbt.getTorrent(qbtTorrentHash);
    if (!torrent) {
      record.reject(new Error('Torrent missing'));
      return true;
    }
    switch (torrent.state as QBTTorrentState) {
      case 'error':
      case 'missingFiles':
        record.reject(new Error(`Torrent at invalid state: ${torrent.state}`));
        return true;
    }
    const lastSyncTime = qbtLastSync ? dayjs(qbtLastSync) : dayjs.unix(0);
    if (dayjs.unix(torrent.completion_on).isAfter(lastSyncTime)) {
      record.resolve({
        downloadPath: torrent.save_path,
        qbtLastSync: new Date(torrent.completion_on * 1000),
        isFailed: false,
        failedAt: null,
        failedReason: '',
      });
      return true;
    }
    return false;
  }
}
