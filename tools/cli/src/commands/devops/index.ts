import { Command, Flags } from "@oclif/core";
import fs from "fs/promises";
import * as inquirer from "inquirer";
import * as yaml from "js-yaml";
import kleur from "kleur";
import { Octokit } from "octokit";
import path from "path";
import simpleGit, { SimpleGit } from "simple-git";
import { loadLaniConfig } from "../../utils/laniconfig";
import { resolveProjectConfig } from "../../utils/project";
import { releaseApplications, releaseInputs } from "../../utils/release";

export default class Devops extends Command {
  static description = "Trigger CI workflow";

  static flags = {
    "no-auto-push": Flags.boolean(),
    strict: Flags.boolean(),
    "log-git": Flags.boolean(),
    "no-cd": Flags.boolean(),
    apps: Flags.string({
      description:
        "Release comma-separated apps together, e.g. api-server,data-server,gateway",
    }),
    environment: Flags.string({
      description: "Deployment environment; otherwise choose interactively",
    }),
  };

  async run(): Promise<void> {
    const {
      flags: {
        "no-auto-push": noAutoPush,
        strict,
        "log-git": logGit,
        "no-cd": noCd,
        apps: appSelection,
        environment: requestedEnvironment,
      },
    } = await this.parse(Devops);

    const project = resolveProjectConfig();
    const config = await loadLaniConfig(project);

    if (!config.ci) {
      console.log(kleur.red("This project has no CI config"));
      process.exit(1);
    }

    if (appSelection && noCd)
      throw new Error(
        "--apps selects a coordinated release and cannot be combined with --no-cd"
      );
    const selected = appSelection
      ? releaseApplications(appSelection)
      : undefined;
    let environments = (config.ci.deployment?.env || []).filter(
      (environment) => environment === "online"
    );
    if (selected) {
      const configs = await Promise.all(
        selected.map((app) =>
          loadLaniConfig({
            ...project,
            packageName: `@lani/${app}`,
            path: path.join(project.monorepoRoot, "apps", app),
          })
        )
      );
      if (
        configs.some(
          (candidate) =>
            !candidate.ci?.deployment ||
            (candidate.ci.workflow &&
              candidate.ci.workflow !== "default_pipeline.yaml")
        )
      ) {
        throw new Error(
          "Selected applications must use the coordinated deployment workflow"
        );
      }
      environments = configs[0].ci!.deployment!.env.filter(
        (env) =>
          env === "online" &&
          configs.every((candidate) =>
            candidate.ci!.deployment!.env.includes(env)
          )
      );
    }
    if (
      requestedEnvironment &&
      (noCd ||
        !environments.includes(
          requestedEnvironment as (typeof environments)[number]
        ))
    ) {
      throw new Error(
        "Requested environment is not shared by the selected applications"
      );
    }
    if (selected && environments.length === 0)
      throw new Error(
        "Selected applications have no common deployment environment"
      );

    console.log(
      kleur.gray(`Command \"devops\" requires \"git\" to be in $PATH`)
    );

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

    const ghHostsPath = path.join(
      process.env.HOME ?? "",
      ".config/gh/hosts.yml"
    );
    const ghHostsContent = await fs.readFile(ghHostsPath, "utf-8");
    const ghHostsDoc = yaml.load(ghHostsContent, {
      filename: ghHostsPath,
    }) as {
      [key in string]: {
        oauth_token: string;
      };
    };
    const ghToken = ghHostsDoc["github.com"].oauth_token;

    const octokit = new Octokit({ auth: ghToken });

    // The tracking ref is the source actually present on the remote, including
    // --no-auto-push mode. Pin it before dispatch so all images use one commit.
    const revision = (await git.revparse([tracking])).trim();
    const coordinated =
      !noCd && (Boolean(selected) || Boolean(config.ci.deployment));
    let inputs: Record<string, string> = {
      ref: revision,
      project_name: project.packageName,
    };
    let workflow =
      config.ci.workflow ??
      (noCd ? "build_generic.yaml" : "default_pipeline.yaml");
    if (coordinated) {
      if (!environments.length)
        throw new Error("No available deployment environment");
      let environment = requestedEnvironment || environments[0];
      if (!requestedEnvironment && environments.length > 1) {
        const result = await inquirer.prompt([
          {
            name: "environment",
            message: "Select deployment environment",
            type: "list",
            choices: environments,
          },
        ]);
        environment = result.environment;
      }
      inputs = releaseInputs(
        revision,
        selected || releaseApplications(project.packageName),
        environment
      );
      workflow = "default_pipeline.yaml";
    }

    const createTime = new Date().getTime();
    const dispatched = await octokit.rest.actions.createWorkflowDispatch({
      owner: "std4453",
      repo: "lani",
      workflow_id: workflow,
      ref: coordinated ? "next" : ref,
      inputs,
    });

    // Newer dispatch responses identify the exact run, avoiding concurrent-run ambiguity.
    const dispatchedRun = dispatched.data as unknown as
      | { html_url?: string }
      | undefined;
    if (dispatchedRun?.html_url) {
      console.log(`Workflow URL: ${kleur.cyan(dispatchedRun.html_url)}`);
      return;
    }
    console.log(kleur.gray("Workflow triggered, waiting for run ID..."));
    let found = false;
    for (let i = 0; i < 10; ++i) {
      const {
        data: {
          workflow_runs: [run],
        },
      } = await octokit.rest.actions.listWorkflowRuns({
        owner: "std4453",
        repo: "lani",
        workflow_id: workflow,
        event: "workflow_dispatch",
        branch: coordinated ? "next" : ref,
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
