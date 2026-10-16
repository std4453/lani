import * as Joi from "joi";

/** 批量导入持久化在 Task 上的有序条目；id 与关联表无关。 */
export interface BatchImportEntry {
  id: string;
  episodeId: number;
  sourcePath: string;
  importPath?: string | null;
  filePath?: string | null;
  nfoPath?: string | null;
  jellyfinEpisodeId?: string | null;
}
const schema = Joi.array()
  .items(
    Joi.object<BatchImportEntry>({
      id: Joi.string().required(),
      episodeId: Joi.number().integer().required(),
      sourcePath: Joi.string().required(),
      importPath: Joi.string().allow(null),
      filePath: Joi.string().allow(null),
      nfoPath: Joi.string().allow(null),
      jellyfinEpisodeId: Joi.string().allow(null),
    })
  )
  .unique("id");
export function batchImportEntries(value: unknown): BatchImportEntry[] {
  if (value == null) return [];
  const result = schema.validate(value, { convert: false });
  if (result.error)
    throw new Error(`批量导入条目无效：${result.error.message}`);
  return result.value;
}
