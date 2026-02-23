// Quantumult X
// 基于 2026-02 接口结构，如果更新接口，可能失效
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
        
        newComments.push(comment);
      }
    });

    console.log("filter after：" + newComments.length);
    obj.data.comments = newComments;

    // // 如果过滤后没评论了，停止翻页
    // if (newComments.length === 0) {
    //   obj.data.has_more = false;
    // }
  }

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log("北京评论过滤脚本错误：" + e);
  $done({ body });
}
