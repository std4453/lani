import {
  AntdSearchContextValues,
  useAntdSearchContext,
} from '@/utils/search/hooks';
import { FilterFilled } from '@ant-design/icons';
import { ProColumns } from '@ant-design/pro-table';
import { Tooltip } from 'antd';
import { ColumnFilterItem, FilterValue } from 'antd/lib/table/interface';
import { useMemo } from 'react';

export type TableColumns<T> = ProColumns<T> & {
  stateKey?:
    | {
        sort: string;
      }
    | {
        filter: string;
        mapValue?: (v: string | number) => FilterValue[number];
      }
    | {
        custom: string;
      };
};

function toProColumn<T>(
  { observedState: state, update }: AntdSearchContextValues,
  { stateKey, ...column }: TableColumns<T>,
): ProColumns<T> {
  return {
    ...column,
    ...(stateKey === undefined
      ? undefined
      : 'sort' in stateKey
      ? {
          defaultSortOrder: state.sort[stateKey.sort],
          sortOrder: state.sort[stateKey.sort],
        }
      : 'filter' in stateKey
      ? {
          defaultFilteredValue: stateKey.mapValue
            ? state.filter[stateKey.filter]?.map(stateKey.mapValue)
            : state.filter[stateKey.filter],
          filteredValue: stateKey.mapValue
            ? state.filter[stateKey.filter]?.map(stateKey.mapValue)
            : state.filter[stateKey.filter],
        }
      : 'custom' in stateKey
      ? {
          filters: state.custom[stateKey.custom]
            ? ([
                {
                  text: '已过滤',
                  value: '_custom_filtered',
                },
              ] as ColumnFilterItem[])
            : undefined,
          filterMultiple: false,
          filterDropdownVisible: false,
          filterIcon: (filtered) =>
            filtered ? (
              <Tooltip title="取消筛选">
                <FilterFilled
                  onClick={() => {
                    update({
                      custom: {
                        [stateKey.custom]: '',
                      },
                    });
                  }}
                />
              </Tooltip>
            ) : null,
          defaultFilteredValue: state.custom[stateKey.custom]
            ? ['_custom_filtered']
            : null,
          filteredValue: state.custom[stateKey.custom]
            ? ['_custom_filtered']
            : null,
        }
      : undefined),
  };
}

export function useProColumns<T>(columns: TableColumns<T>[]) {
  const values = useAntdSearchContext();
  return useMemo(
    () => columns.map((column) => toProColumn(values, column)),
    [values, columns],
  );
}
