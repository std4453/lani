const fs = require('fs');
const ts = require('typescript');

for (const extension of ['.ts', '.tsx']) {
  require.extensions[extension] = (module, filename) => {
    const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: filename,
    });
    module._compile(outputText, filename);
  };
}
// Styles are verified in the browser; these tests check rendered image states.
require.extensions['.less'] = (module) => { module.exports = {}; };
require('./stored-image.test.ts');
