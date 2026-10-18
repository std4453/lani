import { spawnSync } from "child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { join } from "path";
import ts from "typescript";

it("长字幕同形正文和长空白署名不会触发高耗时回溯或误删", () => {
  const directory = mkdtempSync(join(tmpdir(), "torrent-names-performance-"));
  try {
    // 子进程设置硬超时，回归时不会阻塞整个 Jest 进程；直接编译当前源码。
    for (const file of readdirSync(__dirname)) {
      if (!file.endsWith(".ts") || file.endsWith(".test.ts")) continue;
      const compiled = ts
        .transpileModule(readFileSync(join(__dirname, file), "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
          },
        })
        .outputText.replace(/require\("@\//g, 'require("./');
      writeFileSync(join(directory, file.replace(/\.ts$/, ".js")), compiled);
    }
    const name = "简繁".repeat(512) + "!";
    const result = spawnSync(
      process.execPath,
      [
        "-e",
        `
      const { parseTorrentNames } = require('./parseTorrentNames');
      const { parseTorrentOrganization } = require('./parseTorrentOrganization');
      const name = JSON.parse(require('fs').readFileSync(0, 'utf8'));
      const padding = ' '.repeat(8192);
      const author = parseTorrentOrganization('[Publisher] First Tale Subs by ' + padding + 'NoDestination');
      const empty = parseTorrentOrganization('[Publisher] First Tale Subs by ' + padding + '[BD].zip');
      console.log(JSON.stringify({
        aliases: parseTorrentNames('[Publisher] ' + name + ' - 01 [1080p]').title.aliases,
        author: author?.parts,
        empty: empty?.parts,
      }));
    `,
      ],
      {
        cwd: directory,
        input: JSON.stringify(name),
        encoding: "utf8",
        timeout: 5000,
      }
    );
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({
      aliases: [name],
      author: ["Publisher", "NoDestination"],
      empty: ["Publisher"],
    });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}, 15000);
