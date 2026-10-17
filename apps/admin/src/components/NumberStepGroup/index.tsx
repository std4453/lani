import { Button, InputNumber } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.module.less';

/** 按钮直接提交；输入框在回车或失焦时提交输入值。 */
export default function NumberStepGroup({
  value,
  onChange,
  disabled,
  label,
}: {
  value: number;
  onChange(value: number): void;
  disabled?: boolean;
  label: string;
}) {
  const [draft, setDraft] = useState<number | null>(value);
  useEffect(() => setDraft(value), [value]);
  const commit = () => {
    const next = draft === null || !Number.isFinite(draft) ? value : draft;
    setDraft(next);
    if (next !== value) onChange(next);
  };
  const stepButton = (step: number) => {
    return (
      <Button
        key={step}
        style={{ marginLeft: step === -12 ? 0 : -1 }}
        disabled={disabled}
        onClick={() => {
          setDraft(value + step);
          onChange(value + step);
        }}
        aria-label={`${label}${step > 0 ? '增加' : '减少'} ${Math.abs(step)}`}
      >
        {step > 0 ? '+' : ''}
        {step}
      </Button>
    );
  };
  return (
    <div className={styles.group} role="group" aria-label={label}>
      {[-12, -1].map(stepButton)}
      <InputNumber
        aria-label={label}
        controls={false}
        precision={0}
        value={draft}
        disabled={disabled}
        onChange={setDraft}
        onBlur={commit}
        onPressEnter={commit}
      />
      {[1, 12].map(stepButton)}
    </div>
  );
}
