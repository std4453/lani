const { test } = require("node:test");
const assert = require("node:assert/strict");
const { mergeSubtitleInfo } = require("../dist/subtitle-info");

const title = { languages: ["zh", "en"], multi: true, delivery: ["burned-in"] };
const page = {
  status: "known",
  subtitleInfo: {
    languages: ["zh-Hant", "en"],
    multi: true,
    delivery: ["muxed"],
  },
};

test("merges distinct language and delivery evidence, refining Chinese", () => {
  assert.deepEqual(mergeSubtitleInfo(title, page), {
    languages: ["en", "zh-Hant"],
    multi: true,
    delivery: ["burned-in", "muxed"],
  });
  assert.deepEqual(title.languages, ["zh", "en"]);
  assert.deepEqual(page.subtitleInfo.languages, ["zh-Hant", "en"]);
});

test("unknown, malformed and missing page data preserve title evidence", () => {
  for (const result of [
    null,
    {},
    { status: "unknown" },
    { status: "known", subtitleInfo: {} },
    {
      status: "known",
      subtitleInfo: { languages: [1], delivery: [], multi: false },
    },
  ]) {
    assert.equal(mergeSubtitleInfo(title, result), title);
  }
  assert.equal(mergeSubtitleInfo(undefined, null), undefined);
});

test("explicit no subtitles preserves concrete title languages but overrides vague Multi-Sub", () => {
  const none = { status: "none", subtitleInfo: null };
  assert.equal(mergeSubtitleInfo(title, none), title);
  assert.equal(
    mergeSubtitleInfo({ languages: [], multi: true, delivery: [] }, none),
    null
  );
  assert.equal(mergeSubtitleInfo(null, none), null);
});

test("page evidence works without a title result and multiple languages imply multi", () => {
  assert.deepEqual(mergeSubtitleInfo(null, page), {
    ...page.subtitleInfo,
    languages: ["en", "zh-Hant"],
  });
  assert.equal(
    mergeSubtitleInfo(
      { languages: ["en"], multi: false, delivery: [] },
      {
        status: "known",
        subtitleInfo: { languages: ["ja"], multi: false, delivery: [] },
      }
    ).multi,
    true
  );
});
