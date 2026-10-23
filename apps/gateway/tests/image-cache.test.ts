import assert from "assert/strict";
import { imageCacheControl } from "../src/image-cache";
const test = require("node:test").test;

test("caps caching at the remaining v2/v4 signature lifetime", () => {
  const now = Date.parse("2026-10-24T01:00:00Z");
  assert.equal(
    imageCacheControl(`/a?Expires=${now / 1000 + 120}`, now),
    "private, max-age=120"
  );
  assert.equal(
    imageCacheControl("/a?X-Amz-Date=20261024T005900Z&X-Amz-Expires=3600", now),
    "private, max-age=3540"
  );
  assert.equal(
    imageCacheControl(`/a?Expires=${now / 1000 + 7200}`, now),
    "private, max-age=3600"
  );
  for (const url of [
    "/a",
    "/a?Expires=0",
    "/a?Expires=NaN",
    "/a?X-Amz-Date=invalid&X-Amz-Expires=3600",
  ]) {
    assert.equal(imageCacheControl(url, now), "no-store");
  }
});
