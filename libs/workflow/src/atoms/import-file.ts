import * as Joi from "joi";

export interface FileIdentity {
  dev: number;
  ino: number;
  size: number;
  mtimeMs: number;
}
interface FileCheckpointBase {
  source: string;
  target: string;
  temporary: string;
  strategy: string;
  sourceIdentity: FileIdentity;
  removeSource?: boolean;
}
export type FileCheckpoint = FileCheckpointBase &
  (
    | { phase: "prepared"; stagedIdentity?: undefined }
    | { phase: "staged" | "published"; stagedIdentity: FileIdentity }
  );

const identity = Joi.object<FileIdentity>({
  dev: Joi.number().required(),
  ino: Joi.number().required(),
  size: Joi.number().required(),
  mtimeMs: Joi.number().required(),
});
export const fileCheckpointSchema = Joi.object<FileCheckpoint>({
  source: Joi.string().required(),
  target: Joi.string().required(),
  temporary: Joi.string().required(),
  strategy: Joi.string().required(),
  sourceIdentity: identity.required(),
  removeSource: Joi.boolean(),
  phase: Joi.string().valid("prepared", "staged", "published").required(),
  stagedIdentity: identity.when("phase", {
    is: "prepared",
    otherwise: Joi.required(),
  }),
});
