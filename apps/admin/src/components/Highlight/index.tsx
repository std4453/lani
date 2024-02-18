import clsx from 'clsx';
import { escapeRegExp } from 'lodash';
import { useMemo } from 'react';
import styles from './index.module.less';

interface HighlightPart {
  text: string;
  highlight: boolean;
}

export default function Highlight({
  content,
  keyword,
  match,
}: {
  content: string;
  keyword?: string;
  match?:
    | RegExp
    | ((content: string) =>
        | {
            index: number;
            length: number;
          }
        | Array<{
            index: number;
            length: number;
          }>
        | undefined
        | null);
}) {
  const parts = useMemo((): HighlightPart[] => {
    const matchMap = new Array(content.length).fill(false);

    let actualMatch = match;

    if (!actualMatch && keyword) {
      const keywordParts = keyword.split(' ');

      // eslint-disable-next-line @rushstack/security/no-unsafe-regexp
      const matchRegExp = new RegExp(
        keywordParts.map((part) => escapeRegExp(part)).join('|'),
        'ig',
      );

      actualMatch = matchRegExp;
    }

    if (actualMatch instanceof Function) {
      const result = actualMatch(content);
      if (result && Array.isArray(result)) {
        for (const { index, length } of result) {
          for (let i = index; i < index + length; i++) {
            matchMap[i] = true;
          }
        }
      } else if (result) {
        const { index, length } = result;
        for (let i = index; i < index + length; i++) {
          matchMap[i] = true;
        }
      }
    } else if (actualMatch instanceof RegExp) {
      const matchAllResult = content.matchAll(actualMatch);

      for (const result of matchAllResult) {
        const index = result?.index;
        const matchLength = result?.[0]?.length;
        if (typeof index === 'number' && matchLength) {
          for (let i = index; i < index + matchLength; i++) {
            matchMap[i] = true;
          }
        }
      }
    }

    const result: HighlightPart[] = [];

    let lastHighlight = false;
    let lastText = '';
    for (let i = 0; i < content.length; i++) {
      if (matchMap[i] !== lastHighlight) {
        if (lastText) {
          result.push({
            text: lastText,
            highlight: lastHighlight,
          });
        }
        lastText = content[i];
        lastHighlight = matchMap[i];
      } else {
        lastText += content[i];
      }
    }
    if (lastText) {
      result.push({
        text: lastText,
        highlight: lastHighlight,
      });
    }

    return result;
  }, [content, keyword, match]);

  return (
    <>
      {parts.map(({ highlight, text }, index) => (
        <span
          key={index}
          className={clsx({
            [styles.highlight]: highlight,
          })}
        >
          {text}
        </span>
      ))}
    </>
  );
}
