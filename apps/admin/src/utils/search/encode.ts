function encodeArray<T>(array: T[]) {
  return array.join('|');
}

function decodeArray<T extends string = string>(value: string): T[] {
  return value.split('|') as T[];
}

export interface ProFormSearchBase {
  pageSize?: number;
  current?: number;
}

export type ProFormSort = {
  [key in string]?: 'ascend' | 'descend' | null;
};

export type ProFormFilter = {
  [key in string]?: (string | number)[] | null;
};

export type CustomSearch = Record<string, string>;

export function encodeAntdSearch<Search extends Record<string, any>>(
  search: Search & ProFormSearchBase,
  sort: ProFormSort,
  filter: ProFormFilter,
  custom: CustomSearch,
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
    } else if (key === '_revision') {
      // ignore
    } else if (typeof value === 'string' || typeof value === 'number') {
      query[`s_${key}`] = `${value}`;
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const key in sort) {
    const value = sort[key];
    if ((typeof value === 'string' && value) || typeof value === 'number') {
      query[`o_${key}`] = `${value}`;
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const key in filter) {
    const value = filter[key];
    if (
      value instanceof Array &&
      value.length &&
      !value.includes('_custom_filtered')
    ) {
      query[`f_${key}`] = encodeArray(value);
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const key in custom) {
    const value = custom[key];
    if (value) {
      query[`c_${key}`] = `${value}`;
    }
  }
  return query;
}

export function decodeAntdSearch(query: Record<string, string>) {
  const search: Record<string, string> = {};
  const sort: Record<string, 'ascend' | 'descend'> = {};
  const filter: Record<string, (string | number)[]> = {};
  const custom: Record<string, string> = {};
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
    } else if (key.startsWith('c_')) {
      custom[key.substring(2)] = value;
    }
  }

  return {
    search,
    sort,
    filter,
    pageSize,
    current,
    keyword,
    custom,
  };
}

export type AntdTableState = ReturnType<typeof decodeAntdSearch>;
