import { useState } from 'react';
import { InputNumber } from 'antd';

/** 保留正在输入的负数；按钮立即生效，键盘输入在回车或失焦时合并到总偏移。 */
export default function OffsetInput({
  value,
  onChange,
  label,
}: {
  value?: number | null;
  onChange?(value: number | null): void;
  label: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<number | null>(null);
  const commit = () => {
    if (editing) onChange?.(draft);
    setEditing(false);
  };
  return (
    <InputNumber
      aria-label={label}
      precision={0}
      style={{ width: 64 }}
      value={editing ? draft : value}
      onChange={(next) => {
        setDraft(next);
        setEditing(true);
      }}
      onStep={(next) => {
        onChange?.(next);
        setEditing(false);
      }}
      onBlur={commit}
      onPressEnter={commit}
    />
  );
}
