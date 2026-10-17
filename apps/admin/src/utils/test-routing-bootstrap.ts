// 此工厂和启动函数会序列化到同步 head script，必须自包含且不依赖应用模块。
export function createTestRoutingCookies() {
  type Kind = 'frontend' | 'backend';
  return {
    patterns: {
      frontend: /^(?:online|offline|pr-[1-9]\d*)?$/,
      backend: /^(?:online|offline)?$/,
    },
    read(kind: Kind): string {
      const prefix = `lani_${kind}=`;
      return (
        document.cookie
          .split(';')
          .map((cookie) => cookie.trim())
          .find((cookie) => cookie.startsWith(prefix))
          ?.slice(prefix.length) ?? ''
      );
    },
    write(kind: Kind, value: string): void {
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `lani_${kind}=${value}; Path=/; SameSite=Lax${secure}${
        value ? '' : '; Max-Age=0'
      }`;
    },
  };
}

export function initializeTestRouting(
  cookies: ReturnType<typeof createTestRoutingCookies>,
) {
  const url = new URL(window.location.href);
  const kinds = ['frontend', 'backend'] as const;
  const changes = kinds.flatMap((kind) => {
    const values = url.searchParams.getAll(`lani_debug_${kind}`);
    return values.length ? [{ kind, values }] : [];
  });
  if (!changes.length) return;

  for (const kind of kinds) url.searchParams.delete(`lani_debug_${kind}`);
  const target = `${url.pathname}${url.search}${url.hash}`;
  if (
    changes.some(
      ({ kind, values }) =>
        values.length !== 1 ||
        values[0].trim() !== values[0] ||
        !cookies.patterns[kind].test(values[0]),
    )
  ) {
    window.history.replaceState(window.history.state, '', target);
    return;
  }

  try {
    for (const { kind, values } of changes) cookies.write(kind, values[0]);
    if (changes.some(({ kind, values }) => cookies.read(kind) !== values[0])) {
      throw new Error('Routing cookie verification failed');
    }
  } catch {
    // 后端和应用均可能不可用，错误提示不能依赖 React 或组件库。
    const showError = () => {
      const notice = document.createElement('div');
      notice.setAttribute('role', 'alert');
      notice.textContent =
        '测试路由 Cookie 保存失败，请检查浏览器 Cookie 设置后重试';
      notice.style.cssText =
        'position:fixed;top:8px;left:8px;right:8px;z-index:2147483647;' +
        'padding:12px;background:#fff1f0;color:#a8071a;border:1px solid #ffa39e;' +
        'font:14px/1.5 sans-serif;text-align:center';
      document.body.appendChild(notice);
    };
    if (document.body) showError();
    else
      document.addEventListener('DOMContentLoaded', showError, { once: true });
    return;
  }
  window.location.replace(target);
}
