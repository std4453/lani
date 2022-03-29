import { DownloadJob, Prisma } from '@prisma/client';

export abstract class Atom {
  /**
   * @returns {Promise<void>} Resolves with atom result, or throw on error.
   */
  abstract run(job: DownloadJob): Promise<Prisma.DownloadJobUpdateInput>;
}
