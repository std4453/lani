// Jest 27 尚未完整支持 Sharp 原生依赖的 package exports，交给 Node 解析。
module.exports = (request, options) =>
  request.startsWith('@img/')
    ? require.resolve(request, { paths: [options.basedir] })
    : options.defaultResolver(request, options);
