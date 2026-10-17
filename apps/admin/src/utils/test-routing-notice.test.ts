jest.mock('antd', () => ({ message: { info: jest.fn() } }));

import { message } from 'antd';
import { createTestRoutingCookies } from './test-routing-bootstrap';
import { createTestRoutingNotice } from './test-routing-notice';

const cookies = createTestRoutingCookies();
beforeEach(() => {
  jest.clearAllMocks();
  cookies.write('frontend', '');
  cookies.write('backend', '');
});
afterEach(() => jest.restoreAllMocks());

it.each([
  ['', ''],
  ['offline', ''],
  ['', 'offline'],
  ['offline', 'offline'],
])('does not announce default selections (%s, %s)', (frontend, backend) => {
  cookies.write('frontend', frontend);
  cookies.write('backend', backend);
  createTestRoutingNotice()(true);
  expect(message.info).not.toHaveBeenCalled();
});

it.each([false, undefined])(
  'does not announce when the switch is %s',
  (enabled) => {
    cookies.write('frontend', 'pr-123');
    createTestRoutingNotice()(enabled);
    expect(message.info).not.toHaveBeenCalled();
  },
);

it.each([
  ['pr-123', 'offline', '前端 pr-123，后端 offline'],
  ['', 'online', '前端 默认（跟随域名），后端 online'],
  ['online', '', '前端 online，后端 默认（跟随域名）'],
  ['unknown', 'offline', '前端 unknown，后端 offline'],
])(
  'announces the initial selection once (%s, %s)',
  (frontend, backend, content) => {
    cookies.write('frontend', frontend);
    cookies.write('backend', backend);
    const notify = createTestRoutingNotice();
    cookies.write('frontend', 'offline');
    cookies.write('backend', 'offline');
    notify(undefined);
    notify(true);
    notify(true);
    expect(message.info).toHaveBeenCalledTimes(1);
    expect(message.info).toHaveBeenCalledWith(
      expect.objectContaining({ content: `当前路由选择：${content}` }),
    );
  },
);

it('does not break startup when cookie access is forbidden', () => {
  jest.spyOn(document, 'cookie', 'get').mockImplementation(() => {
    throw new Error('Cookies blocked');
  });
  expect(() => createTestRoutingNotice()(true)).not.toThrow();
  expect(message.info).not.toHaveBeenCalled();
});
