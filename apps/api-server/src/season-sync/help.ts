import { DateFormat } from '@/constants/date-format';
import dayjs from 'dayjs';

/**
 * @param airDate YYYY-MM-DD
 */
export function decomposeAirDate(airDate: string): {
  year: number;
  semester: number;
  weekday: number;
} {
  const date = dayjs(airDate, DateFormat.NothingDay);
  // 计算出最近的月初
  const nearestMonthStart =
    date.date() / date.daysInMonth() >= 0.5
      ? date.endOf('month').add(1, 'day')
      : date.startOf('month');
  // 根据最近月初的月份判断季度：
  // 1、2、3月 - 冬季，4、5、6月 - 春季，7、8、9月 - 夏季，10、11、12月 - 秋季
  // 效果上，这使比如 3/16~6/15内首播的动画匹配到春季
  const semester =
    {
      0: 4,
      1: 4,
      2: 4,
      3: 1,
      4: 1,
      5: 1,
      6: 2,
      7: 2,
      8: 2,
      9: 3,
      10: 3,
      11: 3,
    }[nearestMonthStart.month()] ?? 0;
  // dayjs里0表示星期天，6表示星期六，我们这里0表示星期一，7表示星期天
  const weekday = { 0: 6, 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5 }[date.day()] ?? 0;
  return {
    year: date.year(),
    semester,
    weekday,
  };
}
