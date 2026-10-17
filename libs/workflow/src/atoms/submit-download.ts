import * as Joi from "joi";
export interface SubmissionCheckpoint {
  hash: string;
  // hash 保留提交内容的身份；clientHash 是下载器确认后的实际 ID。
  clientHash?: string;
  name?: string;
  phase: "requested" | "confirmed";
}
export const submissionCheckpointSchema = Joi.object<SubmissionCheckpoint>({
  hash: Joi.string().required(),
  clientHash: Joi.string(),
  name: Joi.string().allow(""),
  phase: Joi.string().valid("requested", "confirmed").required(),
});
