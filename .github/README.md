# Build and deployment handoff

`default_pipeline.yaml` builds all four applications and one database migration
image on pushes to `next`. Manual dispatch can select applications with `apps`
or the legacy `project_name`, but not both. Empty selection builds all four.
An admin-only build has no database job. The independent all-in-one workflow
continues to build its own image.

The workflow definition runs from `next`; `ref` selects the application source,
resolved once to a full commit SHA before matrix builds start. Coordinated
`lani-cli devops` calls use this workflow while `--no-cd` keeps the build-only
entry. Deployment currently accepts only `online` and trusted source history.

## Immutable build results

Each selected application, and the database when required, uploads one
`build-result.json` artifact named
`release-build-<app>-attempt-<github.run_attempt>`. Its fields are:

| Field                 | Meaning                                            |
| --------------------- | -------------------------------------------------- |
| `version`             | Contract version, currently `1`                    |
| `repository`          | Source repository full name                        |
| `runId`, `runAttempt` | Strings identifying the exact build execution      |
| `project`             | Package name, such as `@lani/admin` or `@lani/db`  |
| `revision`            | Full checked-out source commit SHA                 |
| `image`               | Immutable registry reference containing `@sha256:` |

All results in one handoff must come from the same source and attempt. A partial
rerun does not authorize combining old and new artifacts; rerun all build jobs
if the selected attempt lacks a complete set. Artifacts expire after seven days,
so expired handoffs require a new build.

## Notification is separate from deployment

Build jobs run on GitHub-hosted runners and receive only their normal build
permissions. A separate notification job has no application checkout or artifact
execution. It requests deployment only after the required builds succeed.
Deployment execution and result reporting belong to the external private system;
a successful build or notification does not establish deployment success.

Automatic notification is off unless `PRIVATE_CD_ENABLED` is `true` and the
`cd-notify` environment has a `PRIVATE_CD_TOKEN`. Maintainers configure the target
using `PRIVATE_CD_REPOSITORY`. Restrict the notification environment to the trusted
workflow branch; never pass its token into build jobs.

When notification is disabled or unconfirmed, the workflow summary includes
manual handoff inputs. Reuse those inputs to avoid duplicate deployment requests.
Do not use mutable image tags or arbitrary images to reconstruct a missing result.
