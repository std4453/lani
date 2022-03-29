function mergeXMLNodeList(source: Array<any>, target: Array<any>) {
  if (!(source instanceof Array)) {
    throw new Error('source node list is not array');
  }
  if (!(target instanceof Array)) {
    throw new Error('target node list is not array');
  }
  // 原先没有、现在有的节点直接覆盖；原先有，现在没有的节点删除；原先和现在都有的merge
  for (let i = 0; i < source.length; i++) {
    if (i < target.length) {
      if (typeof source[i] === 'object' && typeof target[i] === 'object') {
        mergeXMLNode(source[i], target[i]);
      } else if (
        typeof source[i] !== 'object' &&
        typeof target[i] === 'object'
      ) {
        mergeXMLNode({ _: source[i] }, target[i]);
      } else if (
        typeof source[i] === 'object' &&
        typeof target[i] !== 'object'
      ) {
        mergeXMLNode(source[i], { _: target[i] });
      } else {
        target[i] = source[i];
      }
    } else {
      target[i] = source[i];
    }
  }
  target.length = source.length;
}

/**
 * 合并xml文件，原则为：
 * - 幂等性：重复执行保证（至少拓扑上）结果不变
 * - 最大信息：原有信息最少被覆盖
 * 注意source和target里不能有null和undefined，如果需要删除元素，可以在merge后delete
 * @param source 源对象，必须为 object
 * @param target 目标对象，必须为 object
 */
export function mergeXMLNode(source: any, target: any) {
  if (typeof source !== 'object' || !source) {
    throw new Error('source node is not object');
  }
  if (typeof target !== 'object' || !source) {
    throw new Error('target node is not object');
  }
  for (const key in source) {
    if (key === '$') {
      target[key] = {
        ...target[key],
        ...source[key],
      };
    } else if (key === '_') {
      target[key] = source[key];
    } else {
      if (!target[key]) {
        target[key] = source[key];
      } else {
        mergeXMLNodeList(source[key], target[key]);
      }
    }
  }
}

/**
 * 保证xml对象根上有且仅有指定的根元素类型，并返回该根元素，可以用于修改
 * @param target 目标对象，必须为 object
 */
export function ensureXMLRoot(target: any, type: string): any {
  if (typeof target !== 'object' || !target) {
    throw new Error('target root is not object');
  }
  const keys = Object.keys(target);
  if (keys.length > 1) {
    throw new Error('target root has more than one element');
  }
  for (const key of keys) {
    if (key !== type) {
      delete target[key];
    }
  }
  if (!(type in target)) {
    target[type] = {};
  }
  return target[type];
}
