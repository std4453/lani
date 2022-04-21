/**
 * postgraphile使用全局的nodeId作为key，这也是我们做federation时用的key，
 * 其内容为JSON.stringify([typeName, id])，这里我们通过nodeId反向获取id
 *
 * 注意本方法不做任何类型检查，需要调用方保证nodeId来自于postgraphile
 */
export function getIdFromNodeId(nodeId: string) {
  const [, id] = JSON.parse(Buffer.from(nodeId, 'base64').toString()) as [
    string,
    number,
  ];
  return id;
}
