import path from 'path';

// https://stackoverflow.com/questions/37521893/determine-if-a-path-is-subdirectory-of-another-in-node-js
export function isChildPath(parent: string, dir: string) {
  const relative = path.relative(parent, dir);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
}

export interface PathMappingItem {
  from: string;
  to: string;
}

export type PathMapping = PathMappingItem[];

export function mapPath(mapping: PathMapping, input: string) {
  for (const item of mapping) {
    if (isChildPath(item.from, input)) {
      return path.join(item.to, path.relative(item.from, input));
    }
  }
  return input;
}
