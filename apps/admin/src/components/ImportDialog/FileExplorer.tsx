import Highlight from '@/components/Highlight';
import { FileEntry, FileEntryType, ListFilesDocument } from '@/generated/types';
import {
  ArrowLeftOutlined,
  FileOutlined,
  FolderOutlined,
  SearchOutlined,
  SettingOutlined,
  ToTopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@apollo/client';
import { useMemoizedFn } from 'ahooks';
import {
  Badge,
  Breadcrumb,
  Button,
  Checkbox,
  Input,
  Popover,
  Table,
  TableProps,
  Tooltip,
} from 'antd';
import { TableRowSelection } from 'antd/lib/table/interface';
import clsx from 'clsx';
import dayjs from 'dayjs';
import prettyBytes from 'pretty-bytes';
import {
  MouseEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useVT } from 'virtualizedtableforantd4';
import { VIDEO_FILE_MATCHER } from './help';
import styles from './index.scoped.less';

function VirtualTable<T extends object>(props: TableProps<T>) {
  const [vt] = useVT(() => ({ scroll: { y: 'calc(100vh - 400px)' } }), []);

  return (
    <Table<T>
      components={vt}
      scroll={{ y: 'calc(100vh - 400px)' }}
      {...props}
    />
  );
}

type FileExplorerProps = {
  path: string;
  setPath: (path: string) => void;
} & (
  | {
      type: 'single';
      selected: string;
      setSelected: (selected: string) => void;
    }
  | {
      type: 'multiple';
      selected: string[];
      setSelected: (selected: string[]) => void;
    }
);

export function FileExplorer({ path, setPath, ...props }: FileExplorerProps) {
  const [search, setSearch] = useState('');
  const [pathHistory, setPathHistory] = useState<string[]>([]);

  const [showVideoOnly, setShowVideoOnly] = useState(true);
  const [showHidden, setShowHidden] = useState(false);

  const canGoBack = pathHistory.length > 0;

  const handlePathChange = useMemoizedFn(() => {
    setSearch('');
    if (props.type === 'single') {
      props.setSelected('');
    } else {
      props.setSelected([]);
    }
  });

  const goBack = useMemoizedFn(() => {
    if (pathHistory.length) {
      const lastPath = pathHistory[pathHistory.length - 1];
      setPathHistory((history) => history.slice(0, -1));
      setPath(lastPath);
      handlePathChange();
    }
  });

  const canGoUp = path !== '/';

  const goUp = useMemoizedFn(() => {
    const pathNoSlash = path.startsWith('/') ? path.substring(1) : path;
    if (!pathNoSlash) {
      return;
    }
    const parts = pathNoSlash.split('/');
    parts.pop();
    setPathHistory((history) => [...history, path]);
    setPath('/' + parts.join('/'));
    handlePathChange();
  });

  const goTo = useMemoizedFn((newPath: string) => {
    setPathHistory((history) => [...history, path]);
    setPath(newPath);
    handlePathChange();
  });

  const { data, loading } = useQuery(ListFilesDocument, {
    variables: {
      path,
    },
    fetchPolicy: 'no-cache',
  });

  const pathParts = useMemo(() => {
    const parts = (path.startsWith('/') ? path.substring(1) : path).split('/');
    if (parts.length === 1 && parts[0] === '') {
      return [];
    }
    return parts;
  }, [path]);

  const dataSearched = useMemo(() => {
    const files = data?.listFiles;

    if (!files) {
      return [];
    }

    const searchTrimmed = search.trim();

    if (!searchTrimmed) {
      return files;
    }

    const searchParts = searchTrimmed.split(' ');

    return files.filter((file) => {
      for (const searchPart of searchParts) {
        if (!file.name.toLowerCase().includes(searchPart.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  }, [data, search]);

  const dataFiltered = useMemo(() => {
    const filters: ((file: FileEntry) => boolean)[] = [];

    if (showVideoOnly) {
      filters.push(
        (file) =>
          file.type === FileEntryType.Directory ||
          VIDEO_FILE_MATCHER.test(file.path),
      );
    }

    if (!showHidden) {
      filters.push((file) => !file.name.startsWith('.'));
    }

    return filters.reduce((data, filter) => data.filter(filter), dataSearched);
  }, [dataSearched, showHidden, showVideoOnly]);

  const breadcrumbContainerRef = useRef<HTMLDivElement>(null);

  const scrollBreadcrumb = useMemoizedFn(() => {
    const container = breadcrumbContainerRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      left: container.scrollWidth,
      behavior: 'smooth',
    });
  });

  useEffect(() => {
    setTimeout(scrollBreadcrumb, 250);
  }, [scrollBreadcrumb]);

  useLayoutEffect(() => {
    scrollBreadcrumb();
  }, [path, scrollBreadcrumb]);

  const isSelected = useMemo(() => {
    if (props.type === 'single') {
      return (path: string) => props.selected === path;
    } else {
      const selectedPaths = new Set(props.selected);
      return (path: string) => selectedPaths.has(path);
    }
  }, [props.selected, props.type]);

  const [lastSelectIndex, setLastSelectIndex] = useState<number | undefined>();

  const handleSelect = useMemoizedFn(
    (path: string, index: number, e: MouseEvent) => {
      if (props.type === 'single') {
        props.setSelected(path);
      } else {
        if (!e.shiftKey || lastSelectIndex === undefined) {
          if (props.selected.includes(path)) {
            props.setSelected(props.selected.filter((p) => p !== path));
          } else {
            props.setSelected([...props.selected, path]);
          }
          setLastSelectIndex(index);
        } else {
          const currentSelected = props.selected.includes(path);

          const startIndex = Math.min(lastSelectIndex, index);
          const endIndex = Math.max(lastSelectIndex, index);

          const targetSelected = !currentSelected;

          if (targetSelected) {
            props.setSelected(
              Array.from(
                new Set([
                  ...props.selected,
                  ...dataFiltered
                    .slice(startIndex, endIndex + 1)
                    .map((file) => file.path),
                ]),
              ),
            );
          } else {
            const pathInIndexRangeSet = new Set(
              dataFiltered
                .slice(startIndex, endIndex + 1)
                .map((file) => file.path),
            );
            props.setSelected(
              props.selected.filter((path) => !pathInIndexRangeSet.has(path)),
            );
          }

          setLastSelectIndex(undefined);
        }
      }
    },
  );

  const rowSelection = useMemo((): TableRowSelection<FileEntry> | undefined => {
    if (props.type === 'single') {
      return undefined;
    }

    return {
      type: 'checkbox',
      selectedRowKeys: props.selected,
      // eslint-disable-next-line @typescript-eslint/typedef
      getCheckboxProps(record) {
        return {
          disabled: record.type === FileEntryType.Directory,
        };
      },
      // eslint-disable-next-line @typescript-eslint/typedef
      onChange(selectedRowKeys) {
        props.setSelected(selectedRowKeys as string[]);
      },
      columnWidth: 50,
    };
  }, [props]);

  return (
    <>
      <div className={styles.header}>
        <div className={styles.actions}>
          <Tooltip title="返回">
            <Button
              onClick={goBack}
              disabled={!canGoBack}
              icon={<ArrowLeftOutlined />}
            />
          </Tooltip>
          <Tooltip title="上一级">
            <Button
              onClick={goUp}
              disabled={!canGoUp}
              icon={<ToTopOutlined />}
            />
          </Tooltip>
          <Popover
            placement="bottom"
            trigger="click"
            content={
              <div className={styles.settings}>
                <Checkbox
                  checked={showVideoOnly}
                  onChange={(e) => setShowVideoOnly(e.target.checked)}
                >
                  仅显示视频文件
                </Checkbox>
                <Checkbox
                  checked={showHidden}
                  onChange={(e) => setShowHidden(e.target.checked)}
                >
                  显示隐藏文件
                </Checkbox>
              </div>
            }
          >
            <Badge
              count={Number(showVideoOnly) + Number(showHidden)}
              color="#1890ff"
              size="small"
            >
              <Button icon={<SettingOutlined />} />
            </Badge>
          </Popover>
        </div>
        <div
          className={styles.breadcrumbContainer}
          ref={breadcrumbContainerRef}
        >
          <Breadcrumb>
            <Breadcrumb.Item
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                goTo('/');
              }}
            >
              <a href="#">根目录</a>
            </Breadcrumb.Item>
            {pathParts.map((part, index) => (
              <Breadcrumb.Item
                key={index}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo('/' + pathParts.slice(0, index + 1).join('/'));
                }}
              >
                <a href="#">{part}</a>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
        <Input
          suffix={<SearchOutlined />}
          placeholder="搜索当前目录"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.search}
        />
      </div>
      <div className={styles.tableContainer}>
        <VirtualTable<FileEntry>
          loading={loading}
          dataSource={dataFiltered}
          rowKey="path"
          size="small"
          columns={[
            {
              title: '',
              dataIndex: 'type',
              render: (type: FileEntryType) =>
                type === FileEntryType.Directory ? (
                  <FolderOutlined />
                ) : (
                  <FileOutlined />
                ),
              width: props.type === 'multiple' ? 24 : 50,
              align: props.type === 'multiple' ? 'center' : 'right',
            },
            {
              title: '名称',
              dataIndex: 'name',
              render: (name: string) => (
                <Highlight content={name} keyword={search} />
              ),
            },
            {
              title: '修改时间',
              dataIndex: 'lastModified',
              render: (date: string) => (
                <>{dayjs(date).format('YYYY-MM-DD HH:mm:ss')}</>
              ),
              width: 160,
            },
            {
              title: '大小',
              dataIndex: 'size',
              render: (size: string) => (
                <>{size ? prettyBytes(parseInt(size, 10)) : '-'}</>
              ),
              width: 100,
            },
          ]}
          pagination={false}
          onRow={(record, index) => ({
            onClick: (e: MouseEvent) => {
              if (record.type === 'DIRECTORY') {
                goTo(record.path);
              } else {
                handleSelect(record.path, index ?? 0, e);
              }
            },
          })}
          rowClassName={(record) =>
            clsx(styles.row, {
              [styles.directory]: record.type === FileEntryType.Directory,
              [styles.selected]: isSelected(record.path),
            })
          }
          className={styles.table}
          rowSelection={rowSelection}
        />
      </div>
    </>
  );
}
