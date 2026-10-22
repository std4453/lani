import { atomTypes, taskDisplayStatus, Workflow } from "./index";

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
const task = { legacyStage: "AVAILABLE", isFailed: false, isCancelled: false };

test("摘要保留所有执行阶段，流程状态优先于兼容标记", () => {
  for (const atom of atomTypes) {
    expect(
      taskDisplayStatus({
        ...task,
        isFailed: true,
        isCancelled: true,
        workflow: { ...workflow, steps: [{ ...workflow.steps[0], atom }] },
      })
    ).toBe(atom);
  }
});
test.each([
  ["succeeded", "AVAILABLE"],
  ["failed", "DOWNLOAD_FAILED"],
  ["cancelled", "CANCELLED"],
  ["cancelling", "CANCELLING"],
])("转换流程状态 %s", (status, expected) => {
  expect(
    taskDisplayStatus({ ...task, workflow: { ...workflow, status } })
  ).toBe(expected);
});
test("保留旧任务的完成、失败和取消判定", () => {
  expect(taskDisplayStatus(task)).toBe("AVAILABLE");
  expect(taskDisplayStatus({ ...task, isFailed: true })).toBe(
    "DOWNLOAD_FAILED"
  );
  expect(taskDisplayStatus({ ...task, legacyStage: "DOWNLOADING" })).toBe(
    "DOWNLOAD_FAILED"
  );
  expect(taskDisplayStatus({ ...task, isCancelled: true })).toBe("CANCELLED");
});
test("拒绝无效流程，避免产生错误状态摘要", () => {
  expect(() => taskDisplayStatus({ ...task, workflow: {} })).toThrow();
});
