import { Image } from 'antd';
import { useState } from 'react';
import styles from './AddFromBangumiDialog.module.less';

function Cover({
  src,
  previewSrc,
  name,
}: {
  src?: string | null;
  previewSrc?: string | null;
  name: string;
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    'loading',
  );
  return (
    <div className={styles.cover} onClick={(event) => event.stopPropagation()}>
      {src && status !== 'error' && (
        <Image
          src={src}
          alt={`${name}封面`}
          width="100%"
          height="100%"
          className={styles.image}
          style={{ opacity: status === 'loaded' ? 1 : 0 }}
          preview={status === 'loaded' ? { src: previewSrc || src } : false}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      )}
    </div>
  );
}

export default function BangumiCover(props: Parameters<typeof Cover>[0]) {
  return <Cover key={props.src ?? ''} {...props} />;
}
