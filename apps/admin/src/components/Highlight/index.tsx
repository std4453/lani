import clsx from 'clsx';
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
        | undefined
        | null);
}) {
  const parts = useMemo((): HighlightPart[] => {
    if (keyword) {
      const index = content.toLowerCase().indexOf(keyword.toLowerCase());
      if (index < 0) {
        return [{ text: content, highlight: false }];
      } else {
        return [
          {
            text: content.substring(0, index),
            highlight: false,
          },
          {
            text: content.substring(index, index + keyword.length),
            highlight: true,
          },
          {
            text: content.substring(index + keyword.length),
            highlight: false,
          },
        ];
      }
    }
    if (match) {
      if (match instanceof Function) {
        const result = match(content);
        if (!result) {
          return [{ text: content, highlight: false }];
        } else {
          const { index, length } = result;
          return [
            {
              text: content.substring(0, index),
              highlight: false,
            },
            {
              text: content.substring(index, index + length),
              highlight: true,
            },
            {
              text: content.substring(index + length),
              highlight: false,
            },
          ];
        }
      } else {
        const result = content.match(match);
        const index = result?.index;
        const matchLength = result?.[0]?.length;
        if (typeof index !== 'number' || !matchLength) {
          return [{ text: content, highlight: false }];
        } else {
          return [
            {
              text: content.substring(0, index),
              highlight: false,
            },
            {
              text: content.substring(index, index + matchLength),
              highlight: true,
            },
            {
              text: content.substring(index + matchLength),
              highlight: false,
            },
          ];
        }
      }
    }
    return [{ text: content, highlight: false }];
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
