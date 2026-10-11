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

    // Use a separate context and a near-expiry token to test actual cross-tab Web Locks.
    const second = await browser.newContext();
    await second.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort()
    );
    const a = await second.newPage(),
      b = await second.newPage();
    // Login via HTTP avoids the app's proactive refresh before both tabs are ready.
    stack.state.lifetime = 10;
    await second.request.get(
      `${stack.origin}/api/gateway/auth/login?returnTo=/seasons`
    );
    stack.state.lifetime = 120;
    const before = stack.state.refreshes;
    await Promise.all([
      a.goto(`${stack.origin}/seasons`),
      b.goto(`${stack.origin}/seasons`),
    ]);
    await Promise.all([
      a.getByText("Local User", { exact: true }).first().waitFor(),
      b.getByText("Local User", { exact: true }).first().waitFor(),
    ]);
    assert.equal(stack.state.refreshes, before + 1);
    console.log(
      "PASS concurrent tabs perform one strict-rotation refresh across gateway instances"
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

    const nearExpiry = await browser.newContext();
    await nearExpiry.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort()
    );
    stack.state.lifetime = 25;
    await nearExpiry.request.get(
      `${stack.origin}/api/gateway/auth/login?returnTo=/seasons`
    );
    stack.state.lifetime = 120;
    stack.state.unavailable = true;
    const active = await nearExpiry.newPage();
    await active.goto(`${stack.origin}/seasons`);
    await active.getByText("Local User", { exact: true }).first().waitFor();
    stack.state.unavailable = false;
    const count = stack.state.refreshes;
    await active.reload();
    await active.getByText("Local User", { exact: true }).first().waitFor();
    assert.equal(stack.state.refreshes, count + 1);
    console.log(
      "PASS transient proactive-refresh failure retains usable token and recovers"
    );
    await nearExpiry.close();
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
