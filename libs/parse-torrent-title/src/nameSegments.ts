import { cjk, metadata } from "./nameMetadata";

export interface Segment {
  text: string;
  start: number;
  end: number;
  wrapper?: string;
  closer?: string;
}

export const pairs: Record<string, string> = {
  "[": "]",
  "【": "】",
  "(": ")",
  "（": "）",
  "{": "}",
};

export function segments(input: string): Segment[] {
  const result: Segment[] = [];
  let start = 0;
  for (let i = 0; i < input.length; i++) {
    const close = pairs[input[i]];
    if (!close) continue;
    // 下划线连接的词内括注，以及开头括注紧接点号正文，属于同一个名称。
    const closerPosition = input.indexOf(close, i + 1);
    if (
      (input[i] === "(" || input[i] === "（") &&
      closerPosition >= 0 &&
      ((input[i - 1] === "_" &&
        input[closerPosition + 1] === "_" &&
        !metadata(input.slice(i + 1, closerPosition))) ||
        (i === 0 && /^[.]\p{L}/u.test(input.slice(closerPosition + 1))))
    )
      continue;
    // 紧贴正文的方括号是标题内引用，不能拆成多个作品名称。
    if (
      (input[i] === "[" || input[i] === "【") &&
      i > 0 &&
      cjk.test(input[i - 1]) &&
      (cjk.test(input[input.indexOf(close, i + 1) + 1] || "") ||
        /(?:篇|章|编|編)$/.test(
          input.slice(i + 1, input.indexOf(close, i + 1))
        ) ||
        /^\s*[A-Za-z]\s*=/.test(
          input.slice(i + 1, input.indexOf(close, i + 1))
        ))
    )
      continue;
    let depth = 1;
    let end = i + 1;
    for (; end < input.length && depth; end++) {
      if (input[end] === input[i]) depth++;
      else if (
        input[end] === close ||
        (/[)）]/.test(close) && /[)）]/.test(input[end])) ||
        (input[i] === "{" &&
          input[end] === ")" &&
          input.indexOf("}", i + 1) < 0)
      )
        depth--;
    }
    if (depth) continue;
    if (i > start) result.push({ text: input.slice(start, i), start, end: i });
    result.push({
      text: input.slice(i + 1, end - 1),
      start: i,
      end,
      wrapper: input[i],
      closer: input[end - 1],
    });
    start = end;
    i = end - 1;
  }
  if (start < input.length)
    result.push({ text: input.slice(start), start, end: input.length });
  return result;
}
