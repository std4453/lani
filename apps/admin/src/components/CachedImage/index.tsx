import { ImgHTMLAttributes, ReactNode, useState } from 'react';
import { cachedImageUrl, forgetImageUrl, imageSource } from './cache';

interface Props
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> {
  src: string;
  fallback: ReactNode;
}

function ImageContent({ src, fallback, ...props }: Props) {
  const [failedSource, setFailedSource] = useState<string>();
  // 失败地址不再写回缓存，等待上游数据提供新地址。
  const source = src === failedSource ? src : cachedImageUrl(src);
  if (failedSource === source) return <>{fallback}</>;
  return (
    <img
      {...props}
      src={source}
      onError={() => {
        forgetImageUrl(source);
        setFailedSource(source);
      }}
    />
  );
}

export default function CachedImage(props: Props) {
  return <ImageContent key={imageSource(props.src).key} {...props} />;
}
