const applications = ["admin", "api-server", "data-server", "gateway"];

export function releaseApplications(value: string): string[] {
  const selected = value
    .split(",")
    .map((app) => app.trim().replace(/^@lani\//, ""));
  if (
    !selected.length ||
    selected.some((app) => !applications.includes(app)) ||
    new Set(selected).size !== selected.length
  ) {
    throw new Error(
      "Use unique application names: admin,api-server,data-server,gateway"
    );
  }
  return selected.sort();
}

export function releaseInputs(
  revision: string,
  selected: string[],
  environment: string
): Record<string, string> {
  if (!/^[a-f0-9]{40}$/.test(revision))
    throw new Error("Release source must be an immutable commit");
  if (environment !== "online")
    throw new Error("Private deployment currently supports online only");
  const apps = releaseApplications(selected.join(","));
  return { ref: revision, apps: apps.join(","), environment };
}
