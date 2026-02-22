console.log("=== 小红书北京评论过滤脚本开始执行 ===");

let body = $response.body;
if (!body) {
  console.log("响应body为空");
  $done({});
  return;
}

try {
  let obj = JSON.parse(body);
  
  if (obj && obj.data && obj.data.comments && obj.data.comments.length > 0) {
    let originalCount = obj.data.comments.length;
    console.log("原始评论数量: " + originalCount);
    
    let newComments = [];
    
    obj.data.comments.forEach(function(comment) {
      if (comment && comment.ip_location === "北京") {
        let nickname = (comment.user && comment.user.nickname) ? comment.user.nickname : "未知用户";
        
        if (comment.sub_comments && comment.sub_comments.length > 0) {
          let originalSub = comment.sub_comments.length;
          comment.sub_comments = comment.sub_comments.filter(function(sub) {
            return sub && sub.ip_location === "北京";
          });
          console.log("主评论[" + nickname + "] 子评论过滤: " + originalSub + " → " + comment.sub_comments.length);
        }
        
        newComments.push(comment);
        console.log("保留北京评论: " + nickname + " | " + (comment.content ? comment.content.substring(0, 30) : ""));
      }
    });
    
    let finalCount = newComments.length;
    console.log("过滤完成 → 保留北京评论: " + finalCount + " 条");
    
    obj.data.comments = newComments;
    
    if (finalCount === 0) {
      obj.data.has_more = false;
      console.log("无北京评论，已停止翻页");
    }
  } else {
    console.log("未找到评论数据");
  }
  
  console.log("=== 小红书北京过滤脚本执行完成 ===\n");
  $done({ body: JSON.stringify(obj) });
  
} catch (e) {
  console.log("小红书北京评论过滤脚本错误: " + e);
  $done({ body });
}
