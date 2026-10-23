import {
  ImgHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { cachedImageUrl, forgetImageUrl, imageSource } from './cache';

interface Props
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string;
  reload: () => Promise<string | null | undefined>;
  fallback: ReactNode;
}

function ImageContent({ src, reload, fallback, ...props }: Props) {
  const [replacement, setReplacement] =
    useState<{ input: string; src: string }>();
  const source = cachedImageUrl(
    replacement?.input === src ? replacement.src : src,
  );
  const [failedSource, setFailedSource] = useState<string>();
  const [attempt, setAttempt] = useState(0);
  const attempted = useRef<string>();
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const retryWith = (next: string) => {
    attempted.current = next;
    setReplacement({ input: src, src: next });
    setAttempt((value) => value + 1);
  };

  if (failedSource === source) return <>{fallback}</>;
  return (
    <img
      key={attempt}
      {...props}
      src={source}
      onError={async () => {
        if (attempted.current === source) {
          forgetImageUrl(source);
          setFailedSource(source);
          return;
        }
        attempted.current = source;
        forgetImageUrl(source);
        try {
          // 重取地址走现有 GraphQL 鉴权/refresh 流程，不由图片请求刷新会话。
          const next =
            src !== source && imageSource(src).expiresAt > Date.now()
              ? src
              : await reload();
          if (!mounted.current || attempted.current !== source) return;
          if (!next) {
            setFailedSource(source);
            return;
          }
          retryWith(next);
        } catch {
          if (mounted.current) setFailedSource(source);
        }
      }}
    />
  );
}

export default function CachedImage(props: Props) {
  return <ImageContent key={imageSource(props.src).key} {...props} />;
}
