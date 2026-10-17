import { Form, Input, message, Modal, Typography } from 'antd';
import { ReactNode, useRef, useState } from 'react';
import { createTestRoutingCookies } from '@/utils/test-routing-bootstrap';

// 仅供测试：提供手动切换路由的调试入口，不作为正式产品功能或权限控制。
const cookies = createTestRoutingCookies();
const CLICK_INTERVAL_MS = 1000;

export default function TestRoutingTitle({
  children,
}: {
  children: ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const clicks = useRef({ count: 0, last: 0 });
  const [form] = Form.useForm<{ frontend: string; backend: string }>();

  return (
    <>
      <button
        type="button"
        style={{
          border: 0,
          padding: 0,
          background: 'none',
          color: 'inherit',
          font: 'inherit',
          cursor: 'inherit',
          // 移动端工具栏父节点禁用 pointer-events，标题需单独恢复。
          pointerEvents: 'auto',
          touchAction: 'manipulation',
          userSelect: 'none',
        }}
        onClick={() => {
          const now = Date.now();
          const count =
            now - clicks.current.last <= CLICK_INTERVAL_MS
              ? clicks.current.count + 1
              : 1;
          clicks.current = { count, last: now };
          if (count < 5) return;
          clicks.current = { count: 0, last: 0 };
          form.resetFields();
          form.setFieldsValue({
            frontend: cookies.read('frontend'),
            backend: cookies.read('backend'),
          });
          setVisible(true);
        }}
      >
        {children}
      </button>
      <Modal
        title="测试路由"
        visible={visible}
        maskClosable={false}
        forceRender
        okText="保存并刷新"
        cancelText="取消"
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={({ frontend, backend }) => {
            try {
              cookies.write('frontend', frontend);
              cookies.write('backend', backend);
              if (
                cookies.read('frontend') !== frontend ||
                cookies.read('backend') !== backend
              ) {
                void message.error('Cookie 保存失败，请检查浏览器 Cookie 设置');
                return;
              }
              window.location.reload();
            } catch {
              void message.error('Cookie 保存失败，请检查浏览器 Cookie 设置');
            }
          }}
        >
          <Form.Item
            name="frontend"
            label="前端"
            normalize={(value: string) => value.trim()}
            rules={[
              {
                pattern: cookies.patterns.frontend,
                message: '请输入 online、offline 或 pr-编号，也可留空',
              },
            ]}
          >
            <Input placeholder="online / offline / pr-编号" allowClear />
          </Form.Item>
          <Form.Item
            name="backend"
            label="后端"
            normalize={(value: string) => value.trim()}
            rules={[
              {
                pattern: cookies.patterns.backend,
                message: '请输入 online 或 offline，也可留空',
              },
            ]}
          >
            <Input placeholder="online / offline" allowClear />
          </Form.Item>
          <Typography.Text type="secondary">留空恢复默认路由</Typography.Text>
        </Form>
      </Modal>
    </>
  );
}
