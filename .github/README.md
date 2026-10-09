# Build and deployment handoff

`default_pipeline.yaml` builds the complete committed manifest for `next` pushes
and same-repository PRs targeting `next`. It uses the PR head SHA, builds only
missing fingerprints, and still notifies when every image is reused. Open fork
PRs retain the separate manifest check; they do not publish images through this workflow.

On a `next` push, the workflow asks GitHub for PRs associated with that exact
commit. It adds an offline `next` notification target with `mergedPr` only when
exactly one merged PR targets `next` in this repository and its merge SHA equals
the pushed SHA. It builds the manifest once, then runs independent online and
offline notifications. A direct push has only the existing online target;
ambiguous matches fail instead of guessing. This also supports merged fork PRs
without running a privileged workflow on unmerged fork code. The merge commit is
already in trusted `next` history, checked by the existing ancestry validation.

Pre-merge same-repository PRs targeting next deploy to the test environment by
default after building. Notification requires an open PR, a repository owner or
author with write/maintain/admin access, and an unchanged current head SHA.
Automatic PR notification is skipped if the current head commit's full message
**or the current PR title** contains the case-sensitive literal `[skip-cd]`.
The commit marker applies only to that head; the title marker persists until
removed. Skips succeed with the reason in the workflow summary. Neither marker
skips builds, manifest validation, or image preparation. Editing the title alone
does not trigger deployment: the next commit or **Re-run all jobs** rechecks the
latest title and head. Already dispatched requests are not cancelled.

Markers only affect automatic pre-merge PR notifications. Merged-PR next pushes
still notify online and offline/next, and direct next pushes still notify online;
merge commit messages are never scanned for skip markers.
`scope:ui` selects the shared test environment's
preparation policy; it does not restrict which images the target manifest deploys.

For manual runs, select `environment` and `ref` (`next` or `pr/<number>`).
`sourceSha` optionally pins a commit in next history; PR runs resolve the current
head. Manual dispatch is an explicit deployment request and ignores both skip
markers, while retaining author, PR eligibility, and current-head checks.
Online only accepts next. The CLI supports `--environment` and `--ref`;
deployments always reconcile the full manifest. `--no-cd` uses the separate
single-app builder (`app` input). The all-in-one workflow has a fixed app target.

The notification job reads GitHub metadata only and does not check out candidate
code. Notification credentials, Environment access rules, and initial test
baseline setup are maintained in the private deployment runbook.

Notification sends `sourceSha`, `ref`, `environment`, and `automatic`; only the
merged-PR notification adds `mergedPr`. Build or notification success does not
mean deployment succeeded. Failed notification can be retried by rerunning the
whole workflow; fingerprint images are reused.

向 `next` 合入要求分支 up to date，目标分支保持 linear history。同步工作分支可
merge `origin/next` 或 rebase；不强制用 rebase 同步。最终使用 squash/rebase
merge 保持 `next` 线性，详见 [贡献指南](../CONTRIBUTING.md)。
