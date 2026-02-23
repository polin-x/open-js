// Quantumult X - 微博北京IP评论过滤脚本
// 功能：仅保留 user.location 或 source 含“北京”的评论（主+回复）
// 基于2026-02抓包结构，保留广告等非评论项
// 作者：Grok 参考你的旧脚本 + 抓包分析

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);

  if (obj?.items?.length > 0) {
    let kept = 0;
    let filtered = 0;

    let newItems = obj.items.filter(item => {
      // 保留非评论项（如广告 trend）
      if (item.type !== "comment" || !item.data) {
        return true;
      }

      const data = item.data;
      let keepMain = false;

      // 检查主评论
      const mainLoc = data.user?.location || "";
      const mainSrc = data.source || "";
      if (mainLoc.includes("北京") || mainSrc.includes("北京")) {
        keepMain = true;
      }

      // 处理子回复
      let newReplies = [];
      if (data.comments && data.comments.length > 0) {
        newReplies = data.comments.filter(reply => {
          const replyLoc = reply.user?.location || "";
          const replySrc = reply.source || "";
          const isBeijingReply = replyLoc.includes("北京") || replySrc.includes("北京");
          if (isBeijingReply) {
            kept++;
          } else {
            filtered++;
          }
          return isBeijingReply;
        });
        data.comments = newReplies;
      }

      // 主评论是北京 或 有北京子回复 → 保留
      if (keepMain || newReplies.length > 0) {
        kept++;
        return true;
      } else {
        filtered++;
        return false;
      }
    });

    console.log(`[北京评论过滤] 过滤前: ${obj.items.length} | 保留: ${kept} | 移除: ${filtered}`);
    obj.items = newItems;

    // 可选：过滤后若无评论，停止翻页（取消注释）
    // if (kept === 0) {
    //   if (obj.loadedInfo?.paging) obj.loadedInfo.paging.has_more = false;
    // }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`[北京评论过滤] 错误: ${e.message || e}`);
  $done({ body });
}
