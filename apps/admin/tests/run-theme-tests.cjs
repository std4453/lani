// Use the project's TypeScript compiler; no additional test framework required.
const fs = require('fs');
const ts = require('typescript');
require.extensions['.ts'] = (module, filename) => {
  const { outputText } = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    fileName: filename,
  });
  module._compile(outputText, filename);
};
require('./theme.test.ts');
require('./theme-loader.test.ts');
