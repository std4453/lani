const http = require("node:http");

// 仅用于容器启动顺序，不参与 API 请求或队列任务重试。
async function waitForMatcher(endpoint, timeoutMs = 60000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await new Promise((resolve) => {
      const req = http.get(endpoint, (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      });
      req.on("error", () => resolve(false));
      req.setTimeout(Math.min(1000, Math.max(1, deadline - Date.now())), () =>
        req.destroy()
      );
    });
    if (ready) return;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(500, Math.max(1, deadline - Date.now())))
    );
  }
  throw new Error("Local matcher did not become ready during startup");
}

module.exports = { waitForMatcher };
if (require.main === module) {
  waitForMatcher("http://127.0.0.1:8090/v1/status").catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
