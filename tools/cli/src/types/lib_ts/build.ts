import fs from "fs";
import { patchCreateProgram } from "ttypescript/lib/patchCreateProgram.js";
import _ts from "typescript";
import { LaniConfig } from "../../generated/laniconf";
import { ProjectConfig } from "../../utils/project";
import { TypeBuildFn } from "../commands";

const build: TypeBuildFn = async (
  project: ProjectConfig,
  config: LaniConfig
) => {
  const { path: projectPath, cliPath } = project;

  const ts = patchCreateProgram(_ts, false, cliPath);

  const configFile = ts.findConfigFile(projectPath, (fileName) =>
    fs.existsSync(fileName)
  );
  if (!configFile) {
    throw new Error("tsconfig.json not found!");
  }
  const sourceFile = ts.readJsonConfigFile(configFile, (fileName) =>
    fs.readFileSync(fileName, "utf-8")
  );
  const { options, fileNames } = ts.parseJsonSourceFileConfigFileContent(
    sourceFile,
    ts.sys,
    projectPath
  );

  let program = ts.createProgram(fileNames, options);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach((diagnostic) => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(
        diagnostic.file,
        diagnostic.start ?? 0
      );
      let message = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      console.log(
        `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
      );
    } else {
      console.log(
        ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n")
      );
    }
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  process.exit(exitCode);
};

export default build;
