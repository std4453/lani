import { InfoCircleFilled } from '@ant-design/icons';
import { Button, Space } from 'antd';
import 'antd/es/message/style';
import clsx from 'clsx';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './index.module.less';

export default function TaskListUpdateToast({
  visible,
  belowBackdrop,
  onRefresh,
}: {
  visible: boolean;
  belowBackdrop: boolean;
  onRefresh: () => void;
}) {
  const [rendered, setRendered] = useState(visible);
  const containerRef = useRef<HTMLDivElement>(null);
  const [top, setTop] = useState(8);
  const mounted = visible || rendered;
  useLayoutEffect(() => {
    if (!mounted || typeof ResizeObserver === 'undefined') return;
    // 让出其他全局消息的位置，避免刷新失败的错误提示遮住重试按钮。
    const containers = new Set<Element>();
    const measure = () => {
      setTop(
        Math.max(
          8,
          ...Array.from(
            containers,
            (node) => node.getBoundingClientRect().bottom,
          ),
        ),
      );
    };
    const resize = new ResizeObserver(measure);
    const update = () => {
      const others = Array.from(
        document.querySelectorAll('.ant-message'),
      ).filter((node) => node !== containerRef.current);
      for (const node of containers) {
        if (!others.includes(node)) {
          resize.unobserve(node);
          containers.delete(node);
        }
      }
      for (const node of others) {
        if (!containers.has(node)) {
          resize.observe(node);
          containers.add(node);
        }
      }
      measure();
    };
    const mutation = new MutationObserver(update);
    mutation.observe(document.body, { childList: true, subtree: true });
    update();
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, [mounted]);
  useEffect(() => {
    if (visible) {
      setRendered(true);
      return;
    }
    if (!rendered) return;
    // 与 Ant Design MessageMoveOut 的 0.3s 退场时间一致。
    const timer = window.setTimeout(() => setRendered(false), 300);
    return () => window.clearTimeout(timer);
  }, [visible, rendered]);

  if (!visible && !rendered) return null;
  return createPortal(
    <div
      ref={containerRef}
      style={{ top }}
      className={clsx('ant-message', styles.updateToast, {
        [styles.belowBackdrop]: belowBackdrop,
        [styles.closing]: !visible,
      })}
      role="status"
      aria-hidden={!visible}
    >
      <div
        className={clsx('ant-message-notice', {
          'ant-move-up-enter ant-move-up-enter-active': visible,
          'ant-move-up-leave ant-move-up-leave-active': !visible,
        })}
      >
        <div className="ant-message-notice-content">
          <div className="ant-message-custom-content ant-message-info">
            <InfoCircleFilled />
            <span>
              <Space>
                任务列表有更新
                <Button
                  type="link"
                  size="small"
                  disabled={!visible}
                  onClick={onRefresh}
                >
                  刷新
                </Button>
              </Space>
            </span>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
