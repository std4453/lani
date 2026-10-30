import {
  atomTypes,
  AtomRegistry,
  buildWorkflowSnapshot,
  currentStep,
  parseWorkflow,
  requestCancellation,
  retryWorkflow,
  validateDefinition,
} from "./index";
const now = "2026-10-14T12:00:00.000Z";
const registry = Object.fromEntries(
  atomTypes.map((type) => [type, { wants: [] }])
) as unknown as AtomRegistry;
const step = (atom: typeof atomTypes[number]) => ({
  id: atom,
  atom,
  title: atom,
});
it("提交检查点兼容旧 hash 并保留下载器实际 ID", () => {
  for (const submission of [
    { hash: "source-hash", phase: "confirmed" as const },
    {
      hash: "source-hash",
      clientHash: "client-id",
      phase: "confirmed" as const,
    },
  ]) {
    const workflow = buildWorkflowSnapshot(
      [step("submitDownload")],
      registry,
      now
    );
    workflow.steps[0].checkpoint.submission = submission;
    expect(
      parseWorkflow(JSON.parse(JSON.stringify(workflow))).steps[0].checkpoint
        .submission
    ).toEqual(submission);
  }
});
it("不同数量和顺序的流程不依赖固定六步", () => {
  for (const atoms of [
    ["download"],
    ["refreshPlayer", "submitDownload"],
    ["importFile", "download", "findVideoFile"],
  ] as const) {
    const workflow = buildWorkflowSnapshot(atoms.map(step), registry, now);
    expect(workflow.steps.map((s) => s.atom)).toEqual(atoms);
    expect(currentStep(workflow).atom).toBe(atoms[0]);
    expect(parseWorkflow(JSON.parse(JSON.stringify(workflow)))).toEqual(
      workflow
    );
  }
});
it("依赖组之间 AND、组内 OR，且必须在之前出现", () => {
  const r = {
    ...registry,
    refreshPlayer: {
      wants: [["download", "importFile"], ["writeMetadata"]] as const,
    },
  };
  expect(() =>
    validateDefinition(
      ["download", "writeMetadata", "refreshPlayer"].map((a) =>
        step(a as typeof atomTypes[number])
      ),
      r
    )
  ).not.toThrow();
  expect(() =>
    validateDefinition(
      ["importFile", "writeMetadata", "refreshPlayer"].map((a) =>
        step(a as typeof atomTypes[number])
      ),
      r
    )
  ).not.toThrow();
  expect(() =>
    validateDefinition([step("download"), step("refreshPlayer")], r)
  ).toThrow();
  expect(() =>
    validateDefinition(
      [step("refreshPlayer"), step("download"), step("writeMetadata")],
      r
    )
  ).toThrow();
});
it("拒绝空流程、重复标识和未注册原子", () => {
  expect(() => buildWorkflowSnapshot([], registry, now)).toThrow();
  expect(() =>
    buildWorkflowSnapshot([step("download"), step("download")], registry, now)
  ).toThrow();
  expect(() =>
    buildWorkflowSnapshot(
      [{ id: "x", atom: "unknown", title: "未知" }] as never,
      registry,
      now
    )
  ).toThrow();
});
it("取消保留成功步骤，后续步骤取消，取消失败重试不能恢复执行", () => {
  const original = buildWorkflowSnapshot(
    [step("submitDownload"), step("download"), step("importFile")],
    registry,
    now
  );
  original.steps[0].status = "succeeded";
  original.currentStepId = "download";
  original.steps[1].status = "running";
  const cancelled = requestCancellation(original, now);
  expect(cancelled.steps.map((s) => s.status)).toEqual([
    "succeeded",
    "cancelling",
    "cancelled",
  ]);
  expect(requestCancellation(cancelled, "2026-10-15T00:00:00Z")).toBe(
    cancelled
  );
  cancelled.status = "failed";
  cancelled.steps[1].status = "failed";
  const retried = retryWorkflow(cancelled, "2026-10-15T00:00:00Z");
  expect(retried.status).toBe("cancelling");
  expect(retried.cancellation?.requestedAt).toBe(now);
  expect(retried.steps[2].status).toBe("cancelled");
});
it("拒绝未知版本和不完整形状，不重复检查内部时间和计数的业务语义", () => {
  const workflow = buildWorkflowSnapshot([step("download")], registry, now);
  expect(() => parseWorkflow({ ...workflow, schemaVersion: 2 })).toThrow();
  expect(() =>
    parseWorkflow({ ...workflow, currentStepId: "missing" })
  ).toThrow();
  expect(() => parseWorkflow({ ...workflow, steps: [] })).toThrow();
  expect(() => parseWorkflow({ ...workflow, createdAt: 12 })).toThrow();
  expect(
    parseWorkflow({
      ...workflow,
      createdAt: "internal-time",
      definitionVersion: 0,
    }).createdAt
  ).toBe("internal-time");
});

it("定义版本保存在快照中，文件发布检查点必须包含身份", () => {
  const workflow = buildWorkflowSnapshot(
    [step("importFile")],
    registry,
    now,
    7
  );
  expect(parseWorkflow(workflow).definitionVersion).toBe(7);
  const corrupted = JSON.parse(JSON.stringify(workflow));
  corrupted.steps[0].checkpoint.file = {
    source: "/source",
    target: "/target",
    temporary: "/tmp",
    strategy: "copyOnly",
    phase: "published",
    sourceIdentity: { dev: 1, ino: 2, size: 3, mtimeMs: 4 },
  };
  expect(() => parseWorkflow(corrupted)).toThrow();
});

test("取消原因码允许业务自行扩展", () => {
  const flow = buildWorkflowSnapshot(
    [{ id: "download", atom: "download", title: "下载" }],
    registry,
    now
  );
  expect(
    parseWorkflow(
      requestCancellation(flow, now, {
        code: "custom-reason",
        reason: "自定义原因",
      })
    ).cancellation?.code
  ).toBe("custom-reason");
});
