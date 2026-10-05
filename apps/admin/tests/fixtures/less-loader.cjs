// Real Less compilation with a small Node resolver, without starting webpack.
const { createRequire } = require('module');
const umiRequire = createRequire(require.resolve('umi/package.json'));
const less = umiRequire('@umijs/deps/compiled/less');
module.exports = function (source) {
  const callback = this.async();
  const fileManager = new less.FileManager();
  const loadFile = fileManager.loadFile.bind(fileManager);
  fileManager.supports = () => true;
  fileManager.loadFile = (filename, directory, options, environment) =>
    loadFile(
      filename.startsWith('~') ? require.resolve(filename.slice(1)) : filename,
      directory,
      options,
      environment,
    );
  less
    .render(source, {
      ...this.getOptions(),
      filename: this.resourcePath,
      plugins: [
        { install: (_, manager) => manager.addFileManager(fileManager) },
      ],
    })
    .then(({ css }) => callback(null, css), callback);
};
