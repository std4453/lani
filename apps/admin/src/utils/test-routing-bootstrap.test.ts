import {
  createTestRoutingCookies,
  initializeTestRouting,
} from './test-routing-bootstrap';

// 执行实际序列化形式，防止启动脚本意外依赖模块变量或第三方运行时。
const script = `(${initializeTestRouting.toString()})((${createTestRoutingCookies.toString()})());`;
const cookies = createTestRoutingCookies();

function boot(path: string, protocol: string = 'http:') {
  const browser = {
    location: {
      href: `${protocol}//localhost${path}`,
      protocol,
      replace: jest.fn(),
    },
    history: { state: { retained: true }, replaceState: jest.fn() },
  };
  // eslint-disable-next-line no-new-func
  new Function('window', 'document', 'URL', script)(browser, document, URL);
  return browser;
}

beforeEach(() => {
  document.body.innerHTML = '';
  cookies.write('frontend', '');
  cookies.write('backend', '');
});

afterEach(() => jest.restoreAllMocks());

it('ignores ordinary queries without accessing cookies', () => {
  const read = jest.spyOn(document, 'cookie', 'get');
  const write = jest.spyOn(document, 'cookie', 'set');
  const browser = boot('/?lani_frontend=pr-1&lani_backend=online');
  expect(read).not.toHaveBeenCalled();
  expect(write).not.toHaveBeenCalled();
  expect(browser.location.replace).not.toHaveBeenCalled();
  expect(browser.history.replaceState).not.toHaveBeenCalled();
});

it('sets both cookies before navigating and retains unrelated URL parts', () => {
  const browser = boot(
    '/seasons?filter=airing&lani_debug_frontend=pr-123&lani_debug_backend=offline#selected',
  );
  expect(cookies.read('frontend')).toBe('pr-123');
  expect(cookies.read('backend')).toBe('offline');
  expect(browser.location.replace).toHaveBeenCalledTimes(1);
  expect(browser.location.replace).toHaveBeenCalledWith(
    '/seasons?filter=airing#selected',
  );
  expect(
    boot('/seasons?filter=airing#selected').location.replace,
  ).not.toHaveBeenCalled();
});

it('leaves omitted cookies unchanged and deletes explicitly empty cookies', () => {
  cookies.write('frontend', 'pr-9');
  cookies.write('backend', 'online');
  boot('/?lani_debug_frontend=');
  expect(cookies.read('frontend')).toBe('');
  expect(cookies.read('backend')).toBe('online');
  boot('/?lani_debug_backend=');
  expect(cookies.read('backend')).toBe('');
});

it('refreshes once even when the requested value is already selected', () => {
  cookies.write('frontend', 'offline');
  expect(
    boot('/?lani_debug_frontend=offline').location.replace,
  ).toHaveBeenCalledWith('/');
});

it.each([
  'lani_debug_frontend=pr-0',
  'lani_debug_frontend=pr-01',
  'lani_debug_frontend=PR-1',
  'lani_debug_frontend=pr-1%0A',
  'lani_debug_frontend=online&lani_debug_backend=pr-1',
  'lani_debug_frontend=online&lani_debug_frontend=online',
  'lani_debug_frontend=online&lani_debug_backend=offline&lani_debug_backend=',
])('rejects the entire invalid selection: %s', (query) => {
  cookies.write('frontend', 'pr-9');
  cookies.write('backend', 'offline');
  const browser = boot(`/season/1?${query}&filter=kept#episodes`);
  expect(cookies.read('frontend')).toBe('pr-9');
  expect(cookies.read('backend')).toBe('offline');
  expect(browser.location.replace).not.toHaveBeenCalled();
  expect(browser.history.replaceState).toHaveBeenCalledWith(
    browser.history.state,
    '',
    '/season/1?filter=kept#episodes',
  );
});

it.each(['silent', 'throw'])(
  'shows an independent error when writes fail: %s',
  (failure) => {
    jest.spyOn(document, 'cookie', 'set').mockImplementation(() => {
      if (failure === 'throw') throw new Error('Cookies blocked');
    });
    const browser = boot('/?lani_debug_frontend=pr-123');
    // head 执行时可能尚无 body，错误提示在 DOM 可用后仍能独立显示。
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(browser.location.replace).not.toHaveBeenCalled();
    expect(browser.history.replaceState).not.toHaveBeenCalled();
    expect(document.querySelector('[role="alert"]')?.textContent).toContain(
      'Cookie 保存失败',
    );
  },
);

it('uses root-path session cookies with Secure only on HTTPS', () => {
  const setter = jest.spyOn(document, 'cookie', 'set');
  boot('/?lani_debug_frontend=online');
  expect(setter).toHaveBeenLastCalledWith(
    'lani_frontend=online; Path=/; SameSite=Lax',
  );
  boot('/?lani_debug_backend=offline', 'https:');
  expect(setter).toHaveBeenLastCalledWith(
    'lani_backend=offline; Path=/; SameSite=Lax; Secure',
  );
  boot('/?lani_debug_frontend=');
  expect(setter).toHaveBeenLastCalledWith(
    'lani_frontend=; Path=/; SameSite=Lax; Max-Age=0',
  );
});

it('can report a cookie failure before the body has been parsed', () => {
  jest.spyOn(document, 'cookie', 'set').mockImplementation(() => {});
  const body = document.body;
  body.remove();
  try {
    const browser = boot('/?lani_debug_frontend=pr-123');
    expect(browser.location.replace).not.toHaveBeenCalled();
    document.documentElement.appendChild(body);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    expect(document.querySelector('[role="alert"]')?.textContent).toContain(
      'Cookie 保存失败',
    );
  } finally {
    if (!document.body) document.documentElement.appendChild(body);
  }
});
