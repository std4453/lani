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
    // note that we use "/" in branch names so only exclude first part
    const ref = tracking.substring(tracking.indexOf("/") + 1);

    if (ahead !== 0 || behind !== 0) {
      if (noAutoPush) {
        console.log(
          kleur.yellow(
            `Branch '${current}' is ahead ${ahead} and behind ${behind} commit(s) of remote '${tracking}', pipeline will use inconsistent commits`
          )
        );
        if (strict) {
          process.exit(1);
        }
      } else {
        if (ahead !== 0) {
          console.log(
            kleur.yellow(
              `Branch '${current}' is ahead ${ahead} commit(s) of remote '${tracking}', pushing to remote...`
            )
          );
        } else {
          console.log(
            kleur.yellow(
              `Branch '${current}' is ahead ${ahead} and behind ${behind} commit(s) of remote '${tracking}', cannot auto-push, exiting`
            )
          );
          process.exit(1);
        }
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

    const createTime = new Date().getTime();
    await octokit.rest.actions.createWorkflowDispatch({
      owner: globalConfig.owner,
      repo: globalConfig.repo,
      workflow_id: workflow,
      ref,
      inputs,
    });

    console.log(kleur.gray("Workflow triggered, waiting for run ID..."));
    let found = false;
    for (let i = 0; i < 10; ++i) {
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

      if (run) {
        const runCreateTime = new Date(run.created_at).getTime();
        if (runCreateTime > createTime) {
          console.log(`Workflow URL: ${kleur.cyan(run.html_url)}`);
          found = true;
          break;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    if (!found) {
      console.log(
        `Unable to find workflow run, visit ${kleur.cyan(
          `https://github.com/std4453/lani/actions/workflows/${workflow}`
        )} to view details`
      );
      process.exit(1);
    }
  }
}
