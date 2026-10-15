import * as Joi from "joi";
export interface SubmissionCheckpoint {
  hash: string;
  name?: string;
  phase: "prepared" | "requested" | "confirmed";
}
export const submissionCheckpointSchema = Joi.object<SubmissionCheckpoint>({
  hash: Joi.string().required(),
  name: Joi.string().allow(""),
  phase: Joi.string().valid("prepared", "requested", "confirmed").required(),
});
