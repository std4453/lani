import { Command, Flags } from "@oclif/core";
import { loadLaniConfig } from "../../utils/laniconfig";
import { resolveProjectConfig } from "../../utils/project";
import kleur from "kleur";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import * as _ from "lodash";
import { Octokit } from "octokit";
import globalConfig from "../../config";

const DEFAULT_WORKFLOW = "node_default.yaml";

export default class Devops extends Command {
  static description = "Trigger CI workflow";

  static flags = {
    "no-auto-push": Flags.boolean(),
    strict: Flags.boolean(),
    "log-git": Flags.boolean(),
  };

  async run(): Promise<void> {
    const {
      flags: { "no-auto-push": noAutoPush, strict, "log-git": logGit },
    } = await this.parse(Devops);

    const project = resolveProjectConfig();
    const config = await loadLaniConfig(project);

    if (!config.ci) {
      console.log(kleur.red("This project has no CI config"));
      process.exit(1);
    }

    console.log(
      kleur.gray(`Command \"devops\" requires \"git\" to be in $PATH`)
    );

    const { image, workflow = DEFAULT_WORKFLOW } = config.ci;

    const git: SimpleGit = simpleGit({
      baseDir: project.monorepoRoot,
    });

    if (logGit) {
      git.outputHandler((command, stdout, stderr, args) => {
        console.log(kleur.gray(`${command} ${args.join(" ")}`));
        stdout.pipe(process.stdout);
        stderr.pipe(process.stderr);
      });
    }

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
      console.log(kleur.red("Current branch has no tracking branch, aborting"));
      process.exit(1);
    }

    // tracking would be like origin/master, we won't need origin/ here
    const ref = tracking.substring(tracking.lastIndexOf("/") + 1);

    if (ahead !== 0 || behind !== 0) {
      if (noAutoPush) {
        console.log(
          kleur.yellow(
            `Branch '${current}' is ahead ${ahead} and behind ${behind} of remote '${tracking}', pipeline will use inconsistent commits`
          )
        );
        if (strict) {
          process.exit(1);
        }
      } else {
        console.log(
          kleur.yellow(
            `Branch '${current}' is ahead ${ahead} and behind ${behind} of remote '${tracking}', pushing to remote...`
          )
        );
        await git.push();
        console.log(`Push ${kleur.green("success")}`);
      }
    } else {
      console.log(kleur.green("All up-to-date, good to go!"));
    }

    const octokit = new Octokit({ auth: globalConfig.githubPAT });

    const inputs: {
      [x: string]: string;
    } = {
      ref,
      image_name: image,
      project_path: path.relative(project.monorepoRoot, project.path),
      project_name: project.packageName,
    };

    if (config.ci.deployment) {
      const { name } = config.ci.deployment;
      inputs.deploy_name = name;
    }

    await octokit.rest.actions.createWorkflowDispatch({
      owner: globalConfig.owner,
      repo: globalConfig.repo,
      workflow_id: workflow,
      ref,
      inputs,
    });

    const {
      data: {
        workflow_runs: [run],
      },
    } = await octokit.rest.actions.listWorkflowRuns({
      owner: globalConfig.owner,
      repo: globalConfig.repo,
      workflow_id: workflow,
      event: "workflow_dispatch",
    });

    if (!run) {
      console.log(
        `Unable to find workflow run, visit ${kleur.cyan(
          `https://github.com/std4453/lani/actions/workflows/${workflow}`
        )} to view details`
      );
      process.exit(1);
    } else {
      console.log(
        `Workflow triggered, visit ${kleur.cyan(run.html_url)} to view details`
      );
    }
  }
}
