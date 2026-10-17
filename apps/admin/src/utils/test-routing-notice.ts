import { message } from 'antd';
import { createTestRoutingCookies } from './test-routing-bootstrap';

export function createTestRoutingNotice() {
  const cookies = createTestRoutingCookies();
  // 记录本次页面启动时的选择，避免其他标签页修改 cookie 后提示内容发生变化。
  let frontend: string;
  let backend: string;
  try {
    frontend = cookies.read('frontend');
    backend = cookies.read('backend');
  } catch {
    // 浏览器禁止读取 cookie 时，调试提示不能阻断应用启动。
    return () => {};
  }
  let shown = false;
  return (enabled: boolean | undefined) => {
    if (
      enabled !== true ||
      shown ||
      [frontend, backend].every((value) => !value || value === 'offline')
    ) {
      return;
    }
    shown = true;
    void message.info({
      key: 'test-routing-environment',
      content: `当前路由选择：前端 ${frontend || '默认（跟随域名）'}，后端 ${
        backend || '默认（跟随域名）'
      }`,
      duration: 6,
    });
  };
}

export const notifyTestRouting = createTestRoutingNotice();
