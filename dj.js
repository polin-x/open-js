// Quantumult X - 抖音严格北京主评论过滤（最终无干扰版）
// 效果：有北京主评论就只显示它；无北京时页面完全空白；广告全删；翻页正常

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);
  let kept = 0, removedAd = 0, removedNonBj = 0;

  if (obj?.comments?.length > 0) {
    let newComments = obj.comments.filter(comment => {
      // 1. 彻底移除广告
      if (comment.is_ad === true || 
          comment.ad_id || 
          comment.type === "ad" || 
          (comment.user && comment.user.is_ad_fake)) {
        removedAd++;
        return false;
      }

      // 2. 非主评论（子回复）全部保留
      if ((comment.level !== 1 && comment.level !== undefined) || 
          (comment.reply_id !== "0" && comment.reply_id !== undefined && comment.reply_id !== "0")) {
        return true;
      }

      // 3. 只判断主评论的 ip_label 是否北京
      const loc = comment.ip_label || "";
      if (loc.includes("北京")) {
        kept++;
        return true;   // 保留整个主评论 + 所有子回复
      } else {
        removedNonBj++;
        return false;
      }
    });

    // 【关键】本页无北京主评论 → 页面完全空白，但保留翻页能力
    if (newComments.length === 0 && obj.comments.length > 0) {
      console.log(`[抖音北京严格过滤] 本页无北京评论 → 页面完全空白，继续翻页`);
      obj.comments = [];
      // 强制保持翻页
      if (obj.has_more !== undefined) obj.has_more = 1;
      if (obj.cursor !== undefined) {
        // cursor 不变，让客户端继续请求下一页
      }
    } else {
      obj.comments = newComments;
    }
  }

  console.log(`[抖音北京严格过滤] ✅ 广告移除:${removedAd} | 非北京主评论移除:${removedNonBj} | 保留北京主评论:${kept}`);
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`[抖音北京严格过滤] 错误: ${e}`);
  $done({ body });
}
