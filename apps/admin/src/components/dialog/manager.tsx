import { useMemoizedFn } from 'ahooks';
import {
  createContext,
  ElementType,
  ReactNode,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

interface DialogInstance<Key extends string> {
  id: number;
  resolve(response: unknown): void;
  reject(reason?: unknown): void;
  type: Key;
  request: unknown;
}

export interface OpenDialogFn<Request, Response> {
  (request: Request): Promise<Response>;
}

export default function createDialogManager<
  Config extends {
    [x: string]: {
      request: unknown;
      response: unknown;
    };
  },
>(
  config: Record<
    keyof Config,
    {
      singleton?: boolean;
      component: ElementType;
    }
  >,
) {
  const DialogManagerContext = createContext<{
    resolve(id: number, response: unknown): void;
    reject(id: number, reason?: unknown): void;
    open: (
      type: Extract<keyof Config, string>,
      request: unknown,
    ) => Promise<unknown>;
  } | null>(null);
  const DialogContext = createContext<DialogInstance<
    Extract<keyof Config, string>
  > | null>(null);

  function DialogProvider({ children }: { children?: ReactNode }) {
    const nextIdRef = useRef(1);
    const [instances, setInstances] = useState<
      DialogInstance<Extract<keyof Config, string>>[]
    >([]);

    const resolve = useMemoizedFn((id: number, response: unknown) => {
      const instance = instances.find(({ id: _id }) => _id === id);
      if (!instance) {
        console.warn(
          'cannot find requested instance, resolve() was call multiple times?',
        );
        return;
      }
      instance.resolve(response);
      const newInstances = instances.filter(({ id: _id }) => _id !== id);
      setInstances(newInstances);
    });

    const reject = useMemoizedFn((id: number, reason?: unknown) => {
      const instance = instances.find(({ id: _id }) => _id === id);
      if (!instance) {
        console.warn(
          'cannot find requested instance, resolve() was call multiple times?',
        );
        return;
      }
      instance.reject(reason);
      const newInstances = instances.filter(({ id: _id }) => _id !== id);
      setInstances(newInstances);
    });

    const open = useMemoizedFn(
      (type: Extract<keyof Config, string>, request: unknown) => {
        const id = nextIdRef.current;
        nextIdRef.current++;
        return new Promise((resolve, reject) => {
          setInstances((oldInstances) => [
            ...oldInstances,
            {
              id,
              type,
              request,
              resolve,
              reject,
            },
          ]);
        });
      },
    );

    const value = useMemo(
      () => ({
        resolve,
        reject,
        open,
      }),
      [resolve, reject, open],
    );

    const singletonElements = useMemo(() => {
      const elements: ReactNode[] = [];
      for (const type in config) {
        if (typeof type !== 'string') {
          continue;
        }
        if (config[type].singleton) {
          const Component = config[type].component;
          const instance = instances.find(({ type: _type }) => _type === type);
          const value = instance ?? {
            id: 0,
            type: type,
            resolve() {},
            reject() {},
            request: undefined,
          };
          elements.push(
            <DialogContext.Provider value={value} key={type}>
              <Component />
            </DialogContext.Provider>,
          );
        }
      }
      return elements;
    }, [instances]);

    const elements = useMemo(
      () =>
        instances.map((instance) => {
          const { id, type } = instance;
          if (config[type].singleton) {
            return null;
          }
          const Component = config[type].component;
          return (
            <DialogContext.Provider value={instance} key={id}>
              <Component />
            </DialogContext.Provider>
          );
        }),
      [instances],
    );

    return (
      <DialogManagerContext.Provider value={value}>
        {children}
        {singletonElements}
        {elements}
      </DialogManagerContext.Provider>
    );
  }

  function useDialog<Type extends Extract<keyof Config, string>>(
    dialogType: Type,
  ) {
    const managerValues = useContext(DialogManagerContext);
    const values = useContext(DialogContext);
    if (!managerValues || !values) {
      throw new Error('useDialog() cannot be called outside dialog');
    }
    const { id, type, request } = values;
    if (type !== dialogType) {
      throw new Error('useDialog() called with wrong dialog type');
    }
    const { resolve, reject } = managerValues;

    const resolveInner = useMemoizedFn((response: Config[Type]['response']) => {
      resolve(id, response);
    });
    const rejectInner = useMemoizedFn((reason?: unknown) => {
      reject(id, reason);
    });

    return {
      resolve: resolveInner,
      reject: rejectInner,
      params: request as Config[Type]['request'],
    };
  }

  function useSingletonDialog<Type extends Extract<keyof Config, string>>(
    dialogType: Type,
  ) {
    const managerValues = useContext(DialogManagerContext);
    const values = useContext(DialogContext);
    if (!managerValues || !values) {
      throw new Error('useDialog() cannot be called outside dialog');
    }
    const { id, type, request } = values;
    if (type !== dialogType) {
      throw new Error('useDialog() called with wrong dialog type');
    }
    const { resolve, reject } = managerValues;

    const resolveInner = useMemoizedFn((response: Config[Type]['response']) => {
      if (id === 0) {
        throw new Error('resolve() called when dialog not visible');
      }
      resolve(id, response);
    });
    const rejectInner = useMemoizedFn((reason?: unknown) => {
      if (id === 0) {
        throw new Error('reject() called when dialog not visible');
      }
      reject(id, reason);
    });

    return {
      visible: id !== 0,
      resolve: resolveInner,
      reject: rejectInner,
      params: request as Config[Type]['request'] | undefined,
    };
  }

  function useOpenDialog<Type extends Extract<keyof Config, string>>(
    type: Type,
  ) {
    const managerValues = useContext(DialogManagerContext);
    if (!managerValues) {
      throw new Error('useOpenDialog() cannot be called outside dialog');
    }
    return useMemoizedFn(
      (request: Config[Type]['request']): Promise<Config[Type]['response']> =>
        managerValues.open(type, request),
    );
  }

  return {
    DialogProvider,
    useDialog,
    useSingletonDialog,
    useOpenDialog,
  };
}
