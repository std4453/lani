import { AtomType, WorkflowStep } from '@lani/download-workflow';
import { Tag } from 'antd';

const atomColors: Record<AtomType, string> = {
  submitDownload: 'blue',
  download: 'blue',
  findVideoFile: 'purple',
  importFile: 'purple',
  writeMetadata: 'purple',
  refreshPlayer: 'cyan',
};

/** 颜色标识步骤用途，已取消步骤统一置灰。 */
export function WorkflowStepTag({
  step,
}: {
  step: Pick<WorkflowStep, 'atom' | 'title' | 'status'>;
}) {
  return (
    <Tag
      color={step.status === 'cancelled' ? undefined : atomColors[step.atom]}
    >
      {step.title}
    </Tag>
  );
}
