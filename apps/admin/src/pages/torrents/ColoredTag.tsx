import { useTheme } from '@/theme';
import { tagColors } from '@/theme/tagColors';
import { Tag, TagProps, Tooltip } from 'antd';
import md5 from 'md5';
import { CSSProperties, useMemo, useRef, useState } from 'react';
import styles from './index.module.less';

export default function ColoredTag({
  text,
  maxWidth = 160,
  ...props
}: { text: string; maxWidth?: number } & TagProps) {
  const hue = useMemo(
    () => (parseInt(md5(text).substring(0, 4), 16) / 65536) * 360,
    [text],
  );
  const { theme } = useTheme();
  const content = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);
  return (
    <Tooltip title={overflow ? text : undefined}>
      <Tag
        className={styles.tag}
        style={tagColors(hue, theme) as CSSProperties}
        {...props}
        onMouseEnter={() => {
          const element = content.current;
          setOverflow(!!element && element.scrollWidth > element.clientWidth);
        }}
      >
        <span ref={content} className={styles.tagText} style={{ maxWidth }}>
          {text}
        </span>
      </Tag>
    </Tooltip>
  );
}
