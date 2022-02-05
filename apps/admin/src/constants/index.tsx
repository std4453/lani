import { SeasonEnum } from '@/generated/types';
import { DefaultOptionType as SelectOptionType } from 'antd/lib/select';

export const seasonToText: Record<SeasonEnum, string> = {
  SPRING: '春',
  SUMMER: '夏',
  AUTUMN: '秋',
  WINTER: '冬',
};

export const seasonOptions: SelectOptionType[] = [
  {
    value: SeasonEnum.Winter,
    label: '冬（1月）',
    display: seasonToText[SeasonEnum.Winter],
  },
  {
    value: SeasonEnum.Spring,
    label: '春（4月）',
    display: seasonToText[SeasonEnum.Spring],
  },
  {
    value: SeasonEnum.Summer,
    label: '夏（7月）',
    display: seasonToText[SeasonEnum.Summer],
  },
  {
    value: SeasonEnum.Autumn,
    label: '秋（10月）',
    display: seasonToText[SeasonEnum.Autumn],
  },
];
