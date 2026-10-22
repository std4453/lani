import { atomTypes, summarizeWorkflow, Workflow } from "./index";

const workflow: Workflow = {
  schemaVersion: 1,
  definitionVersion: 1,
  status: "running",
  currentStepId: "step",
  createdAt: "2026-10-23T00:00:00Z",
  steps: [
    {
      id: "step",
      atom: "download",
      title: "下载中",
      status: "running",
      attempt: 1,
      checkpoint: {},
    },
  ],
};

test("摘要保留动态步骤顺序、标题、状态和当前位置", () => {
  const steps = atomTypes.map((atom, i) => ({
    ...workflow.steps[0],
    atom,
    id: `dynamic-${i}`,
    title: `自定义步骤 ${i}`,
    status: i === 0 ? ("succeeded" as const) : ("pending" as const),
  }));
  const value = { ...workflow, steps, currentStepId: steps[1].id };
  const summary = summarizeWorkflow(value);
  expect(summary).toEqual({
    status: "running",
    currentStepId: steps[1].id,
    steps: steps.map(({ id, atom, title, status }) => ({
      id,
      atom,
      title,
      status,
    })),
  });
  expect(JSON.stringify(summary)).not.toMatch(
    /checkpoint|attempt|createdAt|definitionVersion/
  );
});
test.each(["running", "succeeded", "failed", "cancelled", "cancelling"])(
  "保留流程状态 %s 而非固定 UI 枚举",
  (status) => {
    expect(summarizeWorkflow({ ...workflow, status }).status).toBe(status);
  }
);
test("拒绝无效流程", () => {
  expect(() => summarizeWorkflow({})).toThrow();
});
