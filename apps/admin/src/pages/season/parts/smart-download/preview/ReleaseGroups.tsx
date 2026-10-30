import { Children, createContext, HTMLAttributes, useContext } from 'react';

export const ReleaseGroupsContext = createContext<
  { key: string; size: number }[]
>([]);

/** 保留 Table 生成的行和单元格，按发布区间限定每个吸顶角标的范围。 */
export default function ReleaseGroups({
  children,
  ...props
}: HTMLAttributes<HTMLTableSectionElement>) {
  const groups = useContext(ReleaseGroupsContext);
  const rows = Children.toArray(children);
  if (!groups.length) return <tbody {...props}>{children}</tbody>;
  let offset = 0;
  return (
    <>
      {groups.map(({ key, size }) => {
        const group = rows.slice(offset, offset + size);
        offset += size;
        return (
          <tbody {...props} key={key}>
            {group}
          </tbody>
        );
      })}
    </>
  );
}
