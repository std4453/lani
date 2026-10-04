// Wrap Umi's own less-loader so both palettes use the same resolver/options.
// Compile independently: a shared import tree reuses light variables/mixins.
module.exports = function themeLoader(source) {
  const { loader, options, postcss: postcssPath } = this.getOptions();
  const original = require(loader);
  const libraryStyle =
    /[/\\]node_modules[/\\](antd|@ant-design[/\\]pro-[^/\\]+)[/\\]/;
  const callback = this.async();
  const compile = (modifyVars) =>
    new Promise((resolve, reject) => {
      const context = Object.create(this);
      const done = (error, css) => (error ? reject(error) : resolve(css));
      const compilerOptions = {
        ...options,
        sourceMap: false,
        modifyVars: {
          ...options.modifyVars,
          ...modifyVars,
        },
      };
      Object.defineProperties(context, {
        query: { value: compilerOptions },
        getOptions: { value: () => compilerOptions },
        async: { value: () => done },
        callback: { value: done },
      });
      original.call(context, source);
    });
  (async () => {
    const light = await compile({});
    if (!libraryStyle.test(this.resourcePath)) return light;
    const { getThemeVariables } = require('antd/dist/theme');
    const dark = await compile(getThemeVariables({ dark: true }));
    const ast = require(postcssPath).parse(dark);
    const keyframes = new Map();
    ast.walkAtRules(/keyframes$/, (rule) => {
      const name = rule.params;
      rule.params = `lani-dark-${name}`;
      keyframes.set(name, rule.params);
    });
    ast.walkDecls(/^animation(-name)?$/, (decl) => {
      decl.value = decl.value.replace(
        /[\w-]+/g,
        (name) => keyframes.get(name) || name,
      );
    });
    ast.walkRules((rule) => {
      if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name))
        return;
      // Zero extra specificity preserves business overrides; html covers portals.
      rule.selectors = rule.selectors.map((selector) =>
        /^(html|:root)(?=[\s.#:[>+~]|$)/.test(selector)
          ? selector.replace(/^(html|:root)/, '$1:where([data-theme="dark"])')
          : `:where(html[data-theme="dark"]) ${selector}`,
      );
    });
    return `${light}\n${ast.toString()}`;
  })().then((css) => callback(null, css), callback);
};
