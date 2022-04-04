import { Typography } from 'antd';
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
}: {
  content: string;
  keyword: string;
}) {
  const parts = useMemo((): HighlightPart[] => {
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
  }, [content, keyword]);

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
