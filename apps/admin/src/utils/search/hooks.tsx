import {
  AntdTableState,
  decodeAntdSearch,
  encodeAntdSearch,
  ProFormFilter,
  ProFormSearchBase,
  ProFormSort,
} from '@/utils/search/encode';
import { ProTableProps, RequestData } from '@ant-design/pro-table';
import { useMemoizedFn } from 'ahooks';
import { TablePaginationConfig } from 'antd';
import { merge } from 'lodash';
import qs from 'qs';
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'umi';

export type AntdSearchUpdate = (update: Partial<AntdTableState>) => void;

export interface AntdSearchContextValues {
  stateRef: MutableRefObject<AntdTableState>;
  update: AntdSearchUpdate;
  observedState: AntdTableState;
  setObservedState: (newState: AntdTableState) => void;
  revision: number;
}

const AntdSearchContext = createContext<AntdSearchContextValues | null>(null);

export function useAntdSearchContext() {
  const value = useContext(AntdSearchContext);
  if (!value) {
    throw new Error(
      'useAntdSearchContext() called outside of withAntdSearch()',
    );
  }
  return value;
}

export function useAntdSearchProps<
  RowType,
  Search extends Record<string, any> = Record<string, any>,
>(
  query: (state: AntdTableState) => Promise<Partial<RequestData<RowType>>>,
  {
    hasKeyword = false,
    pagination: {
      defaultPageSize = 30,
      defaultCurrent = 1,
      ...pagination
    } = {},
  }: {
    hasKeyword?: boolean;
    pagination?: Partial<TablePaginationConfig>;
  } = {},
): Partial<ProTableProps<RowType, Search>> {
  const { stateRef, revision, update, setObservedState } =
    useAntdSearchContext();
  const [keyword, setKeyword] = useState(stateRef.current.keyword);

  const history = useHistory();

  const request = useMemoizedFn(
    async (
      {
        current,
        pageSize,
        keyword,
        _revision,
        ...search
      }: Search & ProFormSearchBase,
      sort: ProFormSort,
      filter: ProFormFilter,
    ) => {
      const newFilter: Record<string, (string | number)[]> = {};
      // eslint-disable-next-line guard-for-in
      for (const key in filter) {
        const value = filter[key];
        if (value instanceof Array) {
          newFilter[key] = value;
        }
      }
      const newSort: Record<string, 'ascend' | 'descend'> = {};
      // eslint-disable-next-line guard-for-in
      for (const key in sort) {
        const value = sort[key];
        if (value) {
          newSort[key] = value;
        }
      }
      const newState: AntdTableState = {
        pageSize: pageSize ?? 30,
        current: current ?? 1,
        filter: newFilter,
        keyword: keyword,
        search,
        sort: newSort,
        custom: stateRef.current.custom,
      };

      stateRef.current = newState;

      try {
        return await query(newState);
      } finally {
        const search = {
          ...newState.search,
          keyword: newState.keyword,
          current: newState.current,
          pageSize: newState.pageSize,
        };
        history.replace({
          pathname: history.location.pathname,
          // SSO 回跳的时候会用 fragment 模式，会添加 hash，然后在处理之后替换成空
          // 由于 react 机制，这里拿到的 history.hash 是替换之前的，因此又会跳回有
          // hash 的状态，不符合预期
          // 由于这个页面并非通用，也没有用到 hash 的地方，简单置空就行
          hash: '',
          query: encodeAntdSearch(
            search,
            newState.sort,
            newState.filter,
            newState.custom,
          ),
        });
        setObservedState(newState);
      }
    },
  );

  const params: Search = useMemo(
    () =>
      ({
        _revision: revision,
      } as any),
    [revision],
  );

  return {
    request,
    options: hasKeyword
      ? {
          search: {
            defaultValue: keyword,
            value: keyword,
            onChange: (e) => setKeyword(e.target.value),
          },
        }
      : undefined,
    pagination: {
      defaultPageSize: stateRef.current.pageSize ?? defaultPageSize,
      defaultCurrent: stateRef.current.current ?? defaultCurrent,
      current: stateRef.current.current ?? defaultCurrent,
      onChange: (current, pageSize) => {
        if (
          stateRef.current.current === current &&
          stateRef.current.pageSize === pageSize
        ) {
          return;
        }
        update({
          current,
          pageSize,
        });
      },
      ...pagination,
    },
    params,
  };
}

function AntdSearchInner<Props>({
  render,
  props,
}: {
  props: Props;
  render: (props: Props) => ReactNode;
}) {
  return <>{render(props)}</>;
}

export function withAntdSearch<Props>(render: (props: Props) => ReactNode) {
  return (props: Props) => {
    const history = useHistory();
    const initialState = useMemo(
      () =>
        decodeAntdSearch(
          qs.parse(history.location.search, {
            ignoreQueryPrefix: true,
          }) as Record<string, string>,
        ),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [],
    );
    const stateRef = useRef(initialState);
    const [observedState, setObservedState] = useState(stateRef.current);

    const [revision, setRevision] = useState(0);
    const update = useMemoizedFn((update: Partial<AntdTableState>) => {
      merge(stateRef.current, update, {
        current: 1,
      });
      setRevision((r) => r + 1);
    });

    const value = useMemo(
      () => ({
        stateRef,
        update,
        revision,
        observedState,
        setObservedState,
      }),
      [stateRef, update, revision, observedState, setObservedState],
    );
    return (
      <AntdSearchContext.Provider value={value}>
        <AntdSearchInner render={render} props={props} />
      </AntdSearchContext.Provider>
    );
  };
}
