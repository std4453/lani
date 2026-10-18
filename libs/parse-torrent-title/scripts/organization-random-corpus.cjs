#!/usr/bin/env node
"use strict";

// 格式独立整理，在首次评分前固定；金标只来自模板参数，不调用解析器。
const FORMAT_VERSION = 2;
const FORMATS = Object.freeze([
  "square-free",
  "square-title-block",
  "corner-free",
  "corner-title-block",
  "round-explicit",
  "wide-round-explicit",
  "joint-amp",
  "joint-wide-amp",
  "joint-cross",
  "joint-plus",
  "joint-mixed",
  "adjacent-square",
  "adjacent-corner",
  "prefix-resolution",
  "prefix-source",
  "prefix-season",
  "prefix-category",
  "prefix-ova",
  "promotion-after",
  "bare-star",
  "role-composition",
  "role-audio",
  "role-reencode",
  "tail-explicit",
  "tail-label",
  "negative-free",
  "negative-title-block",
  "negative-metadata",
  "negative-category",
  "negative-promotion",
  "negative-cross-title",
  "negative-round-alias",
  "scene-dual-signature",
  "bilingual-single",
  "decorated-single",
  "negative-anonymous-role",
]);

function randomSource(seed) {
  let state = 2166136261;
  for (const char of String(seed)) {
    state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  }
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let n = Math.imul(state ^ (state >>> 15), state | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCorpus(seed, count = 10000) {
  if (!Number.isSafeInteger(count) || count < 0) {
    throw new Error("Count must be a non-negative safe integer");
  }
  const random = randomSource(seed);
  const integer = (n) => Math.floor(random() * n);
  const choose = (values) => values[integer(values.length)];
  const letters = () =>
    Array.from({ length: 4 + integer(5) }, () =>
      choose("bcdfghjklmnpqrstvwxyz")
    ).join("");
  const han = () =>
    Array.from({ length: 3 + integer(3) }, () =>
      choose("岚汐砚苇绫槐栎珀鹭笙榆瑾荻棠澜翎穗")
    ).join("");
  const group = (explicit = false) => {
    const code = String(10000 + integer(90000));
    const names = [
      () => `${letters()}${code}`,
      () => `${han()}${code}`,
      () => `${letters()} ${letters()} ${code}`,
      () => `${letters()}-${letters()}${code}`,
      () => `${han()}${letters()}${code}`,
      () => `${integer(90) + 10}${letters()}${code}`,
    ];
    const name = choose(names)();
    return explicit ? name + choose(["字幕组", "字幕社", "制作组"]) : name;
  };
  const rows = [];
  // 每轮打乱整个格式目录，既随机选格式，又保证各格式数量差不超过 1。
  let deck = [];
  for (let i = 0; i < count; i += 1) {
    if (!deck.length) {
      deck = [...FORMATS];
      for (let j = deck.length - 1; j > 0; j -= 1) {
        const k = integer(j + 1);
        [deck[j], deck[k]] = [deck[k], deck[j]];
      }
    }
    const format = deck.pop();
    // 作品名与组名使用不同词料；片名中也随机带数字和标点。
    const title = `${choose([
      "星海旅人",
      "回声档案",
      "雨后的庭院",
      "纸上银河",
      "远方来信",
    ])}${integer(100)} / ${choose([
      "Orbital Letters",
      "Garden of Echoes",
      "Beyond the River",
      "Paper Constellations",
    ])} ${integer(20) + 1}`;
    const episode = String(integer(24) + 1).padStart(2, "0");
    const metadata = choose([
      "[1080p][WEB-DL][AVC AAC][简日内嵌][MP4]",
      "[720P][HEVC-10bit][繁体内封][MKV]",
      "(Baha 1920x1080 AVC AAC MP4)",
    ]);
    const free = `${title} - ${episode} ${metadata}`;
    const blocked = `[${title}][${episode}]${metadata}`;
    const g = group();
    const h = group();
    const k = group();
    let expected = [g];
    let release;
    const explicit = () => {
      const value = group(true);
      expected = [value];
      return value;
    };
    switch (format) {
      case "square-free":
        release = `[${g}] ${free}`;
        break;
      case "square-title-block":
        release = `[${g}]${blocked}`;
        break;
      case "corner-free":
        release = `【${g}】${free}`;
        break;
      case "corner-title-block":
        release = `【${g}】【${title}】【${episode}】${metadata}`;
        break;
      case "round-explicit":
        release = `(${explicit()}) ${free}`;
        break;
      case "wide-round-explicit":
        release = `（${explicit()}）${free}`;
        break;
      case "joint-amp":
        expected = [g, h];
        release = `[${g} & ${h}] ${free}`;
        break;
      case "joint-wide-amp":
        expected = [g, h];
        release = `[${g}＆${h}] ${free}`;
        break;
      case "joint-cross":
        expected = [g, h];
        release = `【${g}×${h}】${blocked}`;
        break;
      case "joint-plus":
        expected = [g, h];
        release = `【${g}+${h}】${free}`;
        break;
      case "joint-mixed":
        expected = [g, h, k];
        release = `[${g}＆${h} & ${k}] ${blocked}`;
        break;
      case "adjacent-square": {
        expected = [group(true), group(true)];
        release = `[${expected[0]}][${expected[1]}]${blocked}`;
        break;
      }
      case "adjacent-corner": {
        expected = [group(true), group(true)];
        release = `【${expected[0]}】【${expected[1]}】${free}`;
        break;
      }
      case "prefix-resolution":
        release = `[1080P][${g}]${blocked}`;
        break;
      case "prefix-source":
        release = `[WEB-DL][${g}] ${free}`;
        break;
      case "prefix-season":
        release = `[${choose(["1", "4", "7", "10"])}月新番][${g}]${blocked}`;
        break;
      case "prefix-category":
        release = `[国漫][${g}] ${free}`;
        break;
      case "prefix-ova":
        release = `（${2000 + integer(25)}年OVA）[${g}] ${free}`;
        break;
      case "promotion-after":
        release = `【${g}】★04月新番★${blocked}[招募翻译校对]`;
        break;
      case "bare-star":
        release = `${explicit()}★${title}★${episode}★1920x1080★AVC AAC MP4★繁体中文`;
        break;
      case "role-composition":
        release = `[${g}合成&压制][TVB粤语]${free}`;
        break;
      case "role-audio":
        release = `[${g}合成&音频压制][ViuTV粤语]${free}`;
        break;
      case "role-reencode":
        release = `[${g}合成&二次压制][代理商粤语]${free}`;
        break;
      case "tail-explicit":
        release = `${free}[${explicit()}]`;
        break;
      case "tail-label":
        release = `${free}[制作组：${g}]`;
        break;
      case "negative-free":
        expected = [];
        release = free;
        break;
      case "negative-title-block":
        expected = [];
        release = blocked;
        break;
      case "negative-metadata":
        expected = [];
        release = `[1080P][WEB-DL]${blocked}`;
        break;
      case "negative-category":
        expected = [];
        release = `[国漫]${free}`;
        break;
      case "negative-promotion":
        expected = [];
        release = `[4月新番]${blocked}[招募翻译]`;
        break;
      case "negative-cross-title":
        expected = [];
        release = `[星海×旅人 ${integer(100)}][${episode}]${metadata}`;
        break;
      case "negative-round-alias":
        expected = [];
        release = `${free}（星海的回声）`;
        break;
      case "scene-dual-signature": {
        const scene = `${letters()}${choose(["-", ".", ""])}${letters()}${
          10000 + integer(90000)
        }`;
        expected = [g, scene];
        release = `[${g}] ${title} - ${episode} [WEB-DL 1080p AVC AAC-${scene}]`;
        break;
      }
      case "bilingual-single": {
        const bilingual = `${han()}${
          10000 + integer(90000)
        }字幕组(${letters()}${10000 + integer(90000)})`;
        expected = [bilingual];
        release = `[${bilingual}] ${free}`;
        break;
      }
      case "decorated-single":
        expected = [`❀${g}❀`];
        release = `[${expected[0]}] ${free}`;
        break;
      case "negative-anonymous-role":
        expected = [];
        release = `[${choose([
          "个人翻译",
          "个人压制",
          "自压",
          "转载",
        ])}]${blocked}`;
        break;
      default:
        throw new Error(`Unknown format: ${format}`);
    }
    rows.push({
      id: `org-random-v${FORMAT_VERSION}:${String(seed)}:${i + 1}`,
      title: release,
      expected_groups: expected,
      format,
    });
  }
  return rows;
}

module.exports = { FORMAT_VERSION, FORMATS, generateCorpus };

if (require.main === module) {
  const args = process.argv.slice(2);
  const value = (key, fallback) => {
    const index = args.indexOf(key);
    return index < 0 ? fallback : args[index + 1];
  };
  const rows = generateCorpus(
    value("--seed", "organization-ci-v2"),
    Number(value("--count", "10000"))
  );
  for (const row of rows) process.stdout.write(`${JSON.stringify(row)}\n`);
}
