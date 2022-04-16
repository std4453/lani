import qs from 'qs';
import { useMemo } from 'react';
import { useHistory } from 'umi';

export function encodeArray<T>(array: T[]) {
  return array.join('|');
}

export function decodeArray<T extends string = string>(value: string): T[] {
  return value.split('|') as T[];
}

interface ProFormSearchBase {
  pageSize?: number;
  current?: number;
}

type ProFormSort = {
  [key in string]?: 'ascend' | 'descend' | null;
};

type ProFormFilter = {
  [key in string]?: (string | number)[] | null;
};

export function encodeAntdSearch<Search extends ProFormSearchBase>(
  search: Search,
  sort: ProFormSort,
  filter: ProFormFilter,
) {
  const query: Record<string, string> = {};
  // eslint-disable-next-line guard-for-in
  for (const key in search) {
    const value = search[key];
    if (key === 'pageSize') {
      if (value) {
        query.s = `${value}`;
      }
    } else if (key === 'current') {
      if (value) {
        query.p = `${value}`;
      }
    } else if (key === 'keyword') {
      if (typeof value === 'string' && value) {
        query.q = value;
      }
    } else if (typeof value === 'string' || typeof value === 'number') {
      query[`s_${key}`] = `${value}`;
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const key in sort) {
    const value = sort[key];
    if (typeof value === 'string' || typeof value === 'number') {
      query[`o_${key}`] = `${value}`;
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const key in filter) {
    const value = filter[key];
    if (value instanceof Array) {
      query[`f_${key}`] = encodeArray(value);
    }
  }
  return query;
}

export function decodeAntdSearch(query: Record<string, string>) {
  const search: Record<string, string> = {};
  const sort: Record<string, 'ascend' | 'descend'> = {};
  const filter: Record<string, (string | number)[]> = {};
  let pageSize: number | undefined = undefined;
  let current: number | undefined = undefined;
  let keyword: string = '';

  // eslint-disable-next-line guard-for-in
  for (const key in query) {
    const value = query[key];
    if (key === 's') {
      pageSize = parseInt(value);
    } else if (key === 'p') {
      current = parseInt(value);
    } else if (key === 'q') {
      keyword = value;
    } else if (key.startsWith('s_')) {
      search[key.substring(2)] = value;
    } else if (key.startsWith('o_')) {
      if (value === 'descend' || value === 'ascend') {
        sort[key.substring(2)] = value;
      }
    } else if (key.startsWith('f_')) {
      filter[key.substring(2)] = decodeArray(value);
    }
  }

  return {
    search,
    sort,
    filter,
    pageSize,
    current,
    keyword,
  };
}

export function useAntdTableState() {
  const history = useHistory();
  return useMemo(() => {
    const result = decodeAntdSearch(
      qs.parse(history.location.search, { ignoreQueryPrefix: true }) as Record<
        string,
        string
      >,
    );
    return result;
  }, [history.location.search]);
}

export type AntdTableState = ReturnType<typeof useAntdTableState>;
