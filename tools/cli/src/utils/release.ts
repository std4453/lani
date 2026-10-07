export function releaseInputs(
  revision: string,
  ref: string,
  environment: string
): Record<string, string> {
  if (!/^[a-f0-9]{40}$/.test(revision))
    throw new Error("Release source must be an immutable commit");
  if (
    !["online", "offline"].includes(environment) ||
    !/^(next|pr\/[1-9][0-9]*)$/.test(ref) ||
    (environment === "online" && ref !== "next")
  )
    throw new Error("Use online/next, offline/next or offline/pr/<number>");
  return {
    ref,
    environment,
    ...(ref === "next" ? { sourceSha: revision } : {}),
  };
}
