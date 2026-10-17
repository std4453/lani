import BatchImportDetailsDialog from '@/components/BatchImportDetailsDialog';
import EpisodeDetailsDialog from '@/components/EpisodeDetailsDialog';
import { TaskType } from '@/generated/types';
import { createUseDialog, DialogProps } from '@/utils/useDialog';

/** 通用入口只分派任务类型；各类任务自行加载详情。 */
export default function TaskDetailsDialog(
  props: DialogProps<{ taskId: number; taskType: TaskType }>,
) {
  switch (props.input?.taskType) {
    case TaskType.BatchImport:
      return <BatchImportDetailsDialog {...props} />;
    case TaskType.Import:
    case TaskType.Download:
      return (
        <EpisodeDetailsDialog
          {...props}
          input={{ taskId: props.input.taskId }}
        />
      );
    default:
      return null;
  }
}
export const useTaskDetailsDialog = createUseDialog(TaskDetailsDialog);
