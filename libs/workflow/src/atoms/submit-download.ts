import * as Joi from "joi";
export interface SubmissionCheckpoint {
  hash: string;
  name?: string;
  phase: "requested" | "confirmed";
}
export const submissionCheckpointSchema = Joi.object<SubmissionCheckpoint>({
  hash: Joi.string().required(),
  name: Joi.string().allow(""),
  phase: Joi.string().valid("requested", "confirmed").required(),
});
