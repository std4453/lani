import { Form, Input, message, Modal, Typography } from 'antd';
import { useEffect, useRef, useState } from 'react';

// 仅供测试：由前端实例的运行配置开启，不作为正式产品功能或权限控制。
const FRONTEND_COOKIE = 'lani_frontend';
const BACKEND_COOKIE = 'lani_backend';
const CLICK_INTERVAL_MS = 1000;

function readCookie(name: string): string {
  const prefix = `${name}=`;
  return (
    document.cookie
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(prefix))
      ?.slice(prefix.length) ?? ''
  );
}

function writeCookie(name: string, value: string): void {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  // 留空删除；否则使用当前域名的会话 cookie，页面和 API 共用根路径。
  document.cookie = `${name}=${value}; Path=/; SameSite=Lax${secure}${
    value ? '' : '; Max-Age=0'
  }`;
}

export default function TestRoutingTitle() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const clicks = useRef({ count: 0, last: 0 });
  const [form] = Form.useForm<{ frontend: string; backend: string }>();

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/test-routing.json', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) return;
        const config = (await response.json()) as { enabled?: boolean };
        setEnabled(config.enabled === true);
      })
      .catch(() => {
        // 配置缺失、无效或请求失败时保持关闭。
      });
    return () => controller.abort();
  }, []);

  if (!enabled) return <>元数据</>;

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
            frontend: readCookie(FRONTEND_COOKIE),
            backend: readCookie(BACKEND_COOKIE),
          });
          setVisible(true);
        }}
      >
        元数据
      </button>
      <Modal
        title="测试路由（仅供测试）"
        visible={visible}
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
              writeCookie(FRONTEND_COOKIE, frontend);
              writeCookie(BACKEND_COOKIE, backend);
              if (
                readCookie(FRONTEND_COOKIE) !== frontend ||
                readCookie(BACKEND_COOKIE) !== backend
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
            label="前端路由 Cookie"
            normalize={(value: string) => value.trim()}
            rules={[
              {
                pattern: /^(?:online|offline|pr-[1-9]\d*)?$/,
                message: '请输入 online、offline 或 pr-编号，也可留空',
              },
            ]}
          >
            <Input placeholder="online / offline / pr-编号" allowClear />
          </Form.Item>
          <Form.Item
            name="backend"
            label="后端路由 Cookie"
            normalize={(value: string) => value.trim()}
            rules={[
              {
                pattern: /^(?:online|offline)?$/,
                message: '请输入 online 或 offline，也可留空',
              },
            ]}
          >
            <Input placeholder="online / offline" allowClear />
          </Form.Item>
          <Typography.Text type="secondary">
            留空恢复域名默认路由。Cookie 在同域标签页间共享；前端 PR
            需已部署。若设置了路由 Header，Header 优先。
          </Typography.Text>
        </Form>
      </Modal>
    </>
  );
}
