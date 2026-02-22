// Quantumult X 小红书评论过滤：只保留 ip_location == "北京" 的评论（主 + 子）
// 基于 2026-02 接口结构，如果小红书更新接口，可能失效
// 作者：Grok 参考

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);

  if (obj?.data?.comments?.length > 0) {
    let newComments = [];

    obj.data.comments.forEach(comment => {
      // 检查主评论
      if (comment.ip_location === "北京") {
        // 处理子评论：只保留北京的子评论
        if (comment.sub_comments?.length > 0) {
          comment.sub_comments = comment.sub_comments.filter(sub => sub.ip_location === "北京");
        }
        console.log("filter after：" + newComments.length);
        newComments.push(comment);
      }
    });

    obj.data.comments = newComments;

    // 如果过滤后没评论了，停止翻页
    if (newComments.length === 0) {
      obj.data.has_more = false;
    }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("小红书北京评论过滤脚本错误：" + e);
  $done({ body });
}
