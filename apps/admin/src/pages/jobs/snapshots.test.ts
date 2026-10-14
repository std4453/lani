import { applyJobSnapshots } from './snapshots';
it('新增、删除和过滤条件变化不会改变当前页成员或顺序', () => {
  const rows = [
    { id: 2, version: 3, isFailed: false },
    { id: 1, version: 1, isFailed: false },
  ] as never;
  const live = [
    { id: 3, version: 1, isFailed: false },
    { id: 1, version: 2, isFailed: true },
  ] as never;
  const displayed = applyJobSnapshots(rows, live);
  expect(displayed.map((row) => row.id)).toEqual([2, 1]);
  expect(displayed[1].isFailed).toBe(true);
  expect(displayed[0]).toBe(rows[0]);
});
it('迟到的旧版本响应不能覆盖当前页状态', () => {
  const rows = [{ id: 1, version: 3, isCancelled: true }] as never;
  const result = applyJobSnapshots(rows, [
    { id: 1, version: 2, isCancelled: false },
  ] as never);
  expect(result[0]).toBe(rows[0]);
});
