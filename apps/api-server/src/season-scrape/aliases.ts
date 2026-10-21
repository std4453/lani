/** 保留名称原有语言和大小写，清理空值、换行及重复项。 */
export function normalizeAliases(values: unknown[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map((value) =>
          value
            // PostgreSQL 文本不能存储 NUL，避免异常来源名称阻断元数据同步。
            .replace(/\u0000/g, '')
            .replace(/[\r\n\u2028\u2029]+/g, ' ')
            .trim(),
        )
        .filter(Boolean),
    ),
  );
}

/** Bangumi 的生成类型未覆盖 infobox 的数组值，按实际响应收窄类型。 */
export function bangumiAliases(
  name: unknown,
  nameCn: unknown,
  infobox: unknown,
): string[] {
  const values: unknown[] = [name, nameCn];
  if (Array.isArray(infobox)) {
    for (const entry of infobox) {
      if (!entry || !['中文名', '别名'].includes(entry.key)) continue;
      if (Array.isArray(entry.value)) {
        values.push(
          ...entry.value.map((item: unknown) =>
            item && typeof item === 'object' && 'v' in item
              ? (item as { v: unknown }).v
              : undefined,
          ),
        );
      } else {
        values.push(entry.value);
      }
    }
  }
  return normalizeAliases(values);
}
