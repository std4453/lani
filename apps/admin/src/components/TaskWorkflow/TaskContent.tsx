import { ComponentProps } from 'react';
import TaskWorkflowView from './index';
import TaskScroll from './TaskScroll';
export default function TaskContent(
  props: ComponentProps<typeof TaskWorkflowView>,
) {
  return (
    <TaskScroll active={props.active}>
      <TaskWorkflowView {...props} />
    </TaskScroll>
  );
}
