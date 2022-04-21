import useMutex from '@/utils/useMutex';
import { Button, ButtonProps } from 'antd';
import { forwardRef, Ref } from 'react';

export default forwardRef(function AsyncButton(
  {
    onClick,
    ...props
  }: Omit<ButtonProps, 'loading'> & {
    onClick: NonNullable<ButtonProps['onClick']>;
  },
  ref?: Ref<HTMLElement>,
) {
  const [loading, onClickWrapped] = useMutex(onClick);

  return (
    <Button {...props} ref={ref} loading={loading} onClick={onClickWrapped} />
  );
});
