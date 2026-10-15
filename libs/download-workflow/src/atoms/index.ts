import * as Joi from "joi";
import { FileCheckpoint, fileCheckpointSchema } from "./import-file";
import {
  SubmissionCheckpoint,
  submissionCheckpointSchema,
} from "./submit-download";
import { refreshStartedAtSchema } from "./refresh-player";
export { FileIdentity, FileCheckpoint } from "./import-file";
export interface Checkpoint {
  submission?: SubmissionCheckpoint;
  file?: FileCheckpoint;
  refreshStartedAt?: string;
}
/** 注册表只组合 atom 自己定义的检查点，不集中实现业务校验。 */
export const atomSchemas = {
  submitDownload: { submission: submissionCheckpointSchema },
  download: {},
  findVideoFile: {},
  importFile: { file: fileCheckpointSchema },
  writeMetadata: {},
  refreshPlayer: { refreshStartedAt: refreshStartedAtSchema },
};
export type AtomType = keyof typeof atomSchemas;
export const atomTypes = Object.keys(atomSchemas) as AtomType[];
export const checkpointSchema = Joi.object<Checkpoint>(
  Object.assign({}, ...Object.values(atomSchemas))
);
