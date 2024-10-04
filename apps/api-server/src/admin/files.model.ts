import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum FileEntryType {
  FILE,
  DIRECTORY,
}

@ObjectType()
export class FileEntry {
  /**
   * 完整路径
   */
  path: string;
  /**
   * 文件类型
   */
  type: FileEntryType;
  /**
   * 文件名称
   */
  name: string;
  /**
   * 体积，只对文件类型有效
   */
  @Field(() => BigInt)
  size?: bigint;
  /**
   * 修改时间
   */
  lastModified: Date;
}

registerEnumType(FileEntryType, {
  name: 'FileEntryType',
});
