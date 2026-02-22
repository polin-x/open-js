// === 小红书测试脚本 ===
// 功能：只打印日志，确认 Quantumult X 是否成功调用脚本
// 如果你在 QX 日志里看到 “=== 测试脚本执行成功 ===” 就代表机制完全通了！

console.log("=== 小红书测试脚本执行成功 ===");

let body = $response.body;
if (!body) $done({});

$done({ body });
