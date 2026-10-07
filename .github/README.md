# Build and deployment handoff

`default_pipeline.yaml` builds the complete committed manifest for `next` pushes
and same-repository PRs targeting `next`. It uses the PR head SHA, builds only
missing fingerprints, and still notifies when every image is reused. Fork PRs
retain the separate manifest check; they do not publish images through this workflow.

PR deployment requires a repository owner or author with write access, an unchanged
PR head, and `[deploy-test]` in that head commit's message. The marker applies to
that commit only. `scope:ui` selects the shared test environment's preparation
policy; it does not restrict which images the target manifest deploys.

For manual runs, select `environment` and `ref` (`next` or `pr/<number>`).
`sourceSha` optionally pins a commit in next history; PR runs resolve the current
head. Online only accepts next. The CLI supports `--environment` and `--ref`;
deployments always reconcile the full manifest. `--no-cd` uses the separate
single-app builder (`app` input). The all-in-one workflow has a fixed app target.

Maintainers configure `PRIVATE_CD_REPOSITORY`, `PRIVATE_CD_ENABLED`, and
`PRIVATE_CD_TOKEN` (target repository Actions write permission) in notification
environments. Keep `cd-notify` restricted to next. `cd-notify-test` permits the
same-repository PR merge refs and next for manually dispatched PR builds; configure
its own token and keep notification disabled until the private test environment
has been initialized. The notification job reads GitHub metadata only and does
not check out candidate code.

Notification sends `sourceSha`, `ref`, `environment`, and `automatic`. Build or
notification success does not mean deployment succeeded. Failed notification can
be retried by rerunning the whole workflow; fingerprint images are reused.
