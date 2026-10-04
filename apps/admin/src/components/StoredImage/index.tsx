import { ImagePath } from '@/constants/icon-path';
import { Button, Image, Spin } from 'antd';
import { useState } from 'react';
import styles from './index.module.less';

interface Props {
  src?: string | null;
  reload: () => Promise<string | null | undefined>;
}

function ImageContent({ src, reload }: Props) {
  const [source, setSource] = useState(src);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'loaded',
  );
  const [attempt, setAttempt] = useState(0);
  const [retrying, setRetrying] = useState(false);

  return (
    <div className={styles.root}>
      {source && status !== 'error' ? (
        <Image
          key={attempt}
          src={source}
          alt="季度图片"
          width="100%"
          height="100%"
          className={styles.image}
          preview={status === 'loaded'}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
        />
      ) : (
        <img
          src={ImagePath.emptyPosterImage}
          alt={source ? '图片加载失败' : '暂无图片'}
          className={styles.placeholder}
        />
      )}
      {source && status === 'loading' && (
        <div className={styles.overlay}>
          <Spin />
        </div>
      )}
      {status === 'error' && (
        <div className={styles.overlay}>
          <Button
            size="small"
            loading={retrying}
            onClick={async () => {
              setRetrying(true);
              try {
                // Obtain a fresh signed URL without resetting the surrounding form.
                const nextSource = await reload();
                setSource(nextSource);
                setAttempt((value) => value + 1);
                setStatus(nextSource ? 'loading' : 'loaded');
              } catch {
                setStatus('error');
              } finally {
                setRetrying(false);
              }
            }}
          >
            重新加载
          </Button>
        </div>
      )}
    </div>
  );
}

export default function StoredImage(props: Props) {
  return <ImageContent key={props.src ?? ''} {...props} />;
}
