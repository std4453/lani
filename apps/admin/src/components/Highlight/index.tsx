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
  match?: RegExp;
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
      const result = content.match(match);
      const index = result?.index;
      const matchLength = result?.[0]?.length;
      if (!index || !matchLength) {
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
