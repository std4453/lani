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
export interface AtomCheckpoint {
  submission?: SubmissionCheckpoint;
  file?: FileCheckpoint;
  mediaVersionId?: number;
  mediaPublished?: boolean;
  refreshStartedAt?: string;
  episodePublished?: boolean;
  publicationClaimed?: boolean;
}
export interface EntryCheckpoint extends AtomCheckpoint {
  completed?: boolean;
}
export interface Checkpoint extends AtomCheckpoint {
  entries?: Record<string, EntryCheckpoint>;
}
/** 注册表只组合 atom 自己定义的检查点，不集中实现业务校验。 */
export const atomSchemas = {
  submitDownload: { submission: submissionCheckpointSchema },
  download: {},
  findVideoFile: {},
  findImportFiles: {},
  importFile: {
    ...publicationCheckpointSchema,
    file: fileCheckpointSchema,
    mediaVersionId: Joi.number().integer().positive(),
    mediaPublished: Joi.boolean(),
  },
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
const checkpointFields = {
  ...Object.assign({}, ...Object.values(atomSchemas)),
};
export const checkpointSchema = Joi.object<Checkpoint>({
  ...checkpointFields,
  entries: Joi.object().pattern(
    Joi.string(),
    Joi.object({ ...checkpointFields, completed: Joi.boolean() })
  ),
});
