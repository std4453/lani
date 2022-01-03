// execa is now ESM-only: https://github.com/sindresorhus/execa/issues/465#issuecomment-997947868
// such that it cannot be require()d: https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c
// solutions include:
// - use ESM ourselves, but
//   - @oclif/core does not yet support ESM: https://github.com/oclif/core/issues/130
//   - node bin script will throw "unknown file extension" without .js extension: https://github.com/nodejs/modules/issues/152
// - use dynamic import() which loads both CJS and ESM, but
//   - dynamic require() is NOT equal to import()
//   - tsc unconditionally transpiles dynamic import() into require(): https://github.com/microsoft/TypeScript/issues/43329
// So the solution is:
// - use https://www.npmjs.com/package/inclusion to avoid dynamic import() getting transpiled, but
// - there's no way to generally type inclusion module, so
// - type usage with execa explicitly
// And usages for execa should be made after dynamic import()

declare module "inclusion" {
  const inclusion: {
    (m: "execa"): Promise<typeof import("execa")>;
  };
  export default inclusion;
}
