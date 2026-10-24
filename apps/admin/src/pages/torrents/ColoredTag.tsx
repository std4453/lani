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
  const [tooltipVisible, setTooltipVisible] = useState(false);
  return (
    <Tooltip
      title={text}
      trigger={['hover', 'focus']}
      open={tooltipVisible}
      onOpenChange={(open) => {
        const element = content.current;
        setTooltipVisible(
          !!(open && element && element.scrollWidth > element.clientWidth),
        );
      }}
    >
      <Tag
        className={styles.tag}
        style={tagColors(hue, theme) as CSSProperties}
        role={props.onClick ? 'button' : undefined}
        tabIndex={props.onClick ? 0 : undefined}
        {...props}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (
            props.onClick &&
            !event.defaultPrevented &&
            (event.key === 'Enter' || event.key === ' ')
          ) {
            event.preventDefault();
            if (!event.repeat) event.currentTarget.click();
          }
        }}
      >
        <span ref={content} className={styles.tagText} style={{ maxWidth }}>
          {text}
        </span>
      </Tag>
    </Tooltip>
  );
}
