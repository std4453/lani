export function normalizeDeclaredEpisodeCount(value: unknown): number | null {
  return typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0 &&
    value <= 2147483647
    ? value
    : null;
}

export function normalizePremiereDate(value: unknown): string | null {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
    ? value
    : null;
}
