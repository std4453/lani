import * as Joi from "joi";
import { FileCheckpoint, fileCheckpointSchema } from "./import-file";
import {
  SubmissionCheckpoint,
  submissionCheckpointSchema,
} from "./submit-download";
import { refreshStartedAtSchema } from "./refresh-player";
import { episodePublishedSchema } from "./publish-episode";
import { publicationCheckpointSchema } from "./publication";
export { FileIdentity, FileCheckpoint } from "./import-file";
export interface Checkpoint {
  submission?: SubmissionCheckpoint;
  file?: FileCheckpoint;
  refreshStartedAt?: string;
  episodePublished?: boolean;
  publicationClaimed?: boolean;
}
/** 注册表只组合 atom 自己定义的检查点，不集中实现业务校验。 */
export const atomSchemas = {
  submitDownload: { submission: submissionCheckpointSchema },
  download: {},
  findVideoFile: {},
  importFile: { ...publicationCheckpointSchema, file: fileCheckpointSchema },
  writeMetadata: publicationCheckpointSchema,
  refreshPlayer: {
    ...publicationCheckpointSchema,
    refreshStartedAt: refreshStartedAtSchema,
  },
  publishEpisode: {
    ...publicationCheckpointSchema,
    episodePublished: episodePublishedSchema,
  },
};
export type AtomType = keyof typeof atomSchemas;
export const atomTypes = Object.keys(atomSchemas) as AtomType[];
export const checkpointSchema = Joi.object<Checkpoint>(
  Object.assign({}, ...Object.values(atomSchemas))
);
