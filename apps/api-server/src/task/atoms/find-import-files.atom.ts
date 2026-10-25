import { BatchableEpisodeAtom } from '../batchable-episode-atom';
import { Injectable } from '@nestjs/common';
import { TaskInput } from '../atom';
import { identity as fileIdentity } from '@/media-pool/files';
import { mapPath } from '@/utils/path';
import { VIDEO_FILE_MATCHER } from '@/utils/video-file';
import config from '@/config';

@Injectable()
export class FindImportFilesAtom extends BatchableEpisodeAtom {
  readonly wants = [];
  protected async runEpisode(_id: number, input: TaskInput) {
    const source = input.sourcePath;
    if (!source || !VIDEO_FILE_MATCHER.test(source))
      throw new Error('请选择视频文件');
    const filename = mapPath(
      config.downloadClient[config.downloadClient.kind].pathMapping,
      source,
    );
    if (!(await fileIdentity(filename))) throw new Error('导入源文件不存在');
    return { importPath: source };
  }
}
