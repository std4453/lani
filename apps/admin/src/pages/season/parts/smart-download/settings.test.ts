import { normalizeOffset, DownloadSettings } from './settings';
const draft = (type: 'advance' | 'postpone', days: number, hours: number) =>
  ({
    downloadOffsetType: type,
    downloadOffsetDays: days,
    downloadOffsetHours: hours,
  } as DownloadSettings);
test.each([
  ['advance', -1, 1, 'postpone', 0, 23],
  ['postpone', -1, 1, 'advance', 0, 23],
  ['advance', 1, -1, 'advance', 0, 23],
  ['postpone', 0, -25, 'advance', 1, 1],
  ['advance', 0, 24, 'advance', 1, 0],
  ['postpone', 1, -24, 'postpone', 0, 0],
] as const)(
  '联动 %s %i 天 %i 小时',
  (type, days, hours, nextType, nextDays, nextHours) => {
    expect(normalizeOffset(draft(type, days, hours))).toMatchObject(
      draft(nextType, nextDays, nextHours),
    );
  },
);
test('清空字段交给表单校验，不把空值强行保存为零', () => {
  const value = { ...draft('advance', 1, 2), downloadOffsetDays: null } as any;
  expect(normalizeOffset(value)).toBe(value);
});
