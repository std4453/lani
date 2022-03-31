import { useMemoizedFn, useSetState } from 'ahooks';
import { ComponentType, ReactNode } from 'react';

export interface DialogState<Input, Output> {
  visible: boolean;
  input?: Input;
  resolve?: (output: Output) => void;
  reject?: () => void;
}

export function useDialog<Input, Output>() {
  const [state, setState] = useSetState<{
    visible: boolean;
    input?: Input;
    resolve?: (output: Output) => void;
    reject?: () => void;
  }>({
    visible: false,
  });
  const open = useMemoizedFn((input: Input) => {
    if (state.visible) {
      return Promise.reject();
    }
    let resolve: ((output: Output) => void) | undefined = undefined;
    let reject: (() => void) | undefined = undefined;
    const promise = new Promise<Output>((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    setState({
      visible: true,
      resolve,
      reject,
      input,
    });
    return promise;
  });
  const resolve = useMemoizedFn((output: Output) => {
    if (state.resolve) {
      state.resolve(output);
      setState({
        visible: false,
        resolve: undefined,
        reject: undefined,
        // 保留input
      });
    }
  });
  const reject = useMemoizedFn(() => {
    if (state.reject) {
      state.reject();
      setState({
        visible: false,
        resolve: undefined,
        reject: undefined,
        // 保留input
      });
    }
  });
  return {
    visible: state.visible,
    input: state.input,
    resolve,
    reject,
    open,
  };
}

export interface DialogProps<Input, Output> {
  visible: boolean;
  input?: Input;
  resolve: (output: Output) => void;
  reject: () => void;
}

export function createUseDialog<Input, Output>(
  Component: ComponentType<DialogProps<Input, Output>>,
) {
  return (): [ReactNode, (input: Input) => Promise<Output>] => {
    const { open, ...props } = useDialog<Input, Output>();
    const dialog = <Component {...props} />;
    return [dialog, open];
  };
}
