// Run after the admin build and the auth-test TypeScript builds. See ../README.md.
const assert = require("node:assert/strict");
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || "playwright");
const { start } = require("./support/local-stack.cjs");

(async () => {
  const stack = await start();
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  // This suite must not contact the shared test environment or the public accounts service.
  await context.route("**/*", (route) =>
    new URL(route.request().url()).hostname === "127.0.0.1"
      ? route.continue()
      : route.abort()
  );
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  try {
    await page.goto(`${stack.origin}/seasons`);
    await page.waitForURL(`${stack.origin}/seasons`);
    await page.getByText("Local User", { exact: true }).first().waitFor();
    assert.equal(stack.state.exchanges, 1);
    assert.ok(stack.state.apiRequests > 0);
    assert.equal(await page.evaluate(() => document.cookie), "");
    console.log(
      "PASS real UI login, encrypted HttpOnly cookie, internal token endpoint, clean URL"
    );

    await page.reload();
    await page.getByText("Local User", { exact: true }).first().waitFor();
    await page.goto(stack.state.callbacks[0]);
    await page.waitForURL(`${stack.origin}/seasons`);
    await page.getByText("Local User", { exact: true }).first().waitFor();
    assert.equal(stack.state.exchanges, 1);
    console.log(
      "PASS reload and replayed callback retain login without exchanging code"
    );

    await page.goto(
      `${stack.origin}/redirect?code=old&state=old&url=${encodeURIComponent(
        "/seasons"
      )}`
    );
    await page.waitForURL(`${stack.origin}/seasons`);
    await page.getByText("Local User", { exact: true }).first().waitFor();
    assert.equal(stack.state.exchanges, 1);
    console.log("PASS old SPA callback bookmarks recover");

    // Both tabs use the same independent gateway session after provider tokens expire.
    const second = await browser.newContext();
    await second.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort()
    );
    const a = await second.newPage(),
      b = await second.newPage();
    // Establish the session before loading either tab.
    stack.state.lifetime = 1;
    await second.request.get(
      `${stack.origin}/api/gateway/auth/login?returnTo=/seasons`
    );
    stack.state.lifetime = 120;
    const before = stack.state.refreshes;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    stack.state.unavailable = true;
    await Promise.all([
      a.goto(`${stack.origin}/seasons`),
      b.goto(`${stack.origin}/seasons`),
    ]);
    await Promise.all([
      a.getByText("Local User", { exact: true }).first().waitFor(),
      b.getByText("Local User", { exact: true }).first().waitFor(),
    ]);
    assert.equal(stack.state.refreshes, before);
    console.log(
      "PASS concurrent tabs use expired provider tokens without any refresh or accounts access"
    );

    stack.state.unavailable = true;
    await page.reload();
    await page.getByText("Local User", { exact: true }).first().waitFor();
    console.log("PASS accounts outage does not interrupt an existing login");
    stack.state.unavailable = false;

    const csrf = await page.evaluate(
      async () =>
        (
          await fetch("/api/gateway/auth/logout", { method: "POST" })
        ).status
    );
    assert.equal(csrf, 403);
    await page.getByText("Local User", { exact: true }).first().hover();
    await page.getByText("登出", { exact: true }).click();
    await page.getByRole("button", { name: /^登\s*录$/ }).waitFor();
    const exchanges = stack.state.exchanges;
    await page.reload();
    await page.getByRole("button", { name: /^登\s*录$/ }).waitFor();
    assert.equal(stack.state.exchanges, exchanges);
    console.log(
      "PASS CSRF protection and logout without an automatic login loop"
    );
    await page.goto(
      `${stack.origin}/api/gateway/auth/callback?code=used&state=unknown`
    );
    await page.getByRole("button", { name: "重试登录", exact: true }).waitFor();
    assert.equal(stack.state.exchanges, exchanges);
    assert.ok(!page.url().includes("code="));
    if (process.env.AUTH_SCREENSHOT)
      await page.screenshot({ path: process.env.AUTH_SCREENSHOT });
    await page.getByRole("button", { name: "重试登录", exact: true }).click();
    await page.getByText("Local User", { exact: true }).first().waitFor();
    console.log(
      "PASS invalid callback gives a clean retry page and login recovers"
    );

    // A gateway rejection must reach the existing login UI, with no automatic replay.
    let rejected = 0;
    await page.route("**/api/gateway/graphql", async (route) => {
      rejected++;
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          errors: [
            {
              message: "Session expired",
              extensions: { code: "UNAUTHENTICATED" },
            },
          ],
        }),
      });
    });
    const loginCount = stack.state.exchanges;
    await page.reload();
    await page.getByRole("button", { name: "重试登录", exact: true }).waitFor();
    const rejectionCount = rejected;
    await page.waitForTimeout(500);
    assert.equal(rejected, rejectionCount);
    assert.equal(stack.state.exchanges, loginCount);
    assert.equal(stack.state.refreshes, 0);
    assert.ok(!page.url().includes("code="));
    console.log(
      "PASS expired gateway session shows login without token refresh, redirect loops or operation replay"
    );
    assert.deepEqual(errors, []);
    await second.close();
  } catch (error) {
    console.error("Browser URL:", page.url());
    console.error(
      "Page text:",
      (await page.locator("body").innerText()).slice(0, 1500)
    );
    console.error("Page errors:", errors);
    throw error;
  } finally {
    await browser.close();
    await stack.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
