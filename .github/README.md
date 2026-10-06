# Build and deployment handoff

Pushes to `next` run `default_pipeline.yaml`. The committed build manifest identifies
all application and migration images; only missing fingerprints are built.
Once the requested images are available, the workflow notifies the private deployment
system, including when every image was reused. Deployment compares the complete target
with its successful environment baseline, so later runs can include previously missed changes.

For manual builds, select `ref` and optional `apps`. The CLI still supports coordinated
builds and the independent build-only entry. The all-in-one workflow remains separate.

Maintainers configure `PRIVATE_CD_REPOSITORY`, `PRIVATE_CD_ENABLED`, and the
`cd-notify` environment's `PRIVATE_CD_TOKEN` with target Actions write permission.
Restrict that environment to `next`; the token belongs only to the notification job.
Environment configuration and deployment credentials belong to the private system.

Notification sends `sourceSha`, `applications`, `environment`, and `automatic`.
A successful build or notification does not mean deployment succeeded. An unconfirmed
notification fails the workflow; rerun it or use the manual inputs in its summary.
