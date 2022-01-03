import { Command, Flags } from "@oclif/core";
import { loadLaniConfig } from "../../utils/laniconfig";
import { resolveProjectConfig } from "../../utils/project";
import kleur from "kleur";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import * as _ from "lodash";

const DEFAULT_WORKFLOW = "node_default.yaml";

export default class Devops extends Command {
  static description = "Trigger CI workflow";

  static flags = {
    "no-git": Flags.boolean(),
    strict: Flags.boolean({
      default: false,
    }),
    ref: Flags.string(),
    "dry-run": Flags.boolean(),
  };

  async run(): Promise<void> {
    const {
      flags: { "no-git": noGit, strict, ref, "dry-run": dry },
    } = await this.parse(Devops);

    const project = resolveProjectConfig();
    const config = await loadLaniConfig(project);

    if (!config.ci) {
      console.log(kleur.red("This project has no CI config"));
      process.exit(1);
    }

    console.log(
      kleur.gray(
        `Command \"devops\" requires \"git\" and \"gh\" to be in $PATH`
      )
    );

    const { image, workflow = DEFAULT_WORKFLOW } = config.ci;

    const args = {
      ref,
      image_name: image,
      project_path: path.relative(project.monorepoRoot, project.path),
      project_name: project.packageName,
    };

    if (!noGit) {
      const git: SimpleGit = simpleGit({
        baseDir: project.monorepoRoot,
      });

      await git.fetch();

      const { current, tracking, ahead, behind, detached, files } =
        await git.status();

      if (strict && files.length !== 0) {
        console.log(kleur.red("Working tree not clean, aborting"));
        process.exit(1);
      }

      if (detached) {
        console.log(kleur.red("Repo in detached HEAD mode, aborting"));
        process.exit(1);
      }

      if (!tracking) {
        console.log(
          kleur.red("Current branch has no tracking branch, aborting")
        );
        process.exit(1);
      }

      // tracking would be like origin/master, we won't need origin/ here
      args.ref = tracking.substring(tracking.lastIndexOf("/") + 1);

      if (ahead !== 0 || behind !== 0) {
        console.log(
          kleur.yellow(
            `Branch '${current}' is ahead ${ahead} and behind ${behind} of remote '${tracking}', pipeline will use inconsistent commits`
          )
        );

        if (strict) {
          process.exit(1);
        }
      } else {
        console.log(kleur.green("All up-to-date, good to go!"));
      }
    }

    if (!args.ref) {
      console.log(kleur.red("Ref not found, aborting"));
      process.exit(1);
    }

    const ghArgs = [
      "workflow",
      "run",
      workflow,
      ..._.toPairs(args).flatMap(([key, value]) => ["-f", `${key}=${value}`]),
    ];
    if (!dry) {
      const { execa } = await import("execa");

      const subprocess = execa("gh", ghArgs);
      subprocess.stdout?.pipe(process.stdout);
      await subprocess;

      console.log(
        `Workflow triggered, visit https://github.com/std4453/lani/actions/workflows/${workflow} to see the workflow run`
      );
    } else {
      console.log("gh", ...ghArgs);
    }
  }
}
