// Quantumult X - 微博严格北京主评论过滤（最终无干扰版）
// 效果：有北京主评论就只显示它；无北京时页面完全空白（无干扰）；广告全删；翻页正常

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);
  let kept = 0, removedAd = 0, removedNonBj = 0;

  if (obj?.items?.length > 0) {
    let newItems = obj.items.filter(item => {
      // 1. 彻底移除所有广告
      if (item.type === "trend" || item.data?.is_ad === 1) {
        removedAd++;
        return false;
      }

      // 2. 非评论项全部保留
      if (item.type !== "comment" || !item.data) {
        return true;
      }

      // 3. 只判断主评论是否北京
      const data = item.data;
      const loc =  (data.source || "");

      if (loc.includes("北京")) {
        kept++;
        return true;   // 保留整个主评论 + 子回复
      } else {
        removedNonBj++;
        return false;
      }
    });

    // 【关键】当本页没有北京主评论时
    // → 页面完全空白（不显示任何内容，无干扰）
    // → 但强制保留翻页能力，保证能继续上拉翻下一页
    if (newItems.length === 0) {
      console.log(`[北京严格过滤] 本页无北京评论 → 页面完全空白，继续翻页`);
      obj.items = [];  // 清空所有内容
      // 强制保持翻页参数
      if (obj.loadedInfo && obj.loadedInfo.paging) {
        obj.loadedInfo.paging.has_more = true;
      }
      if (obj.max_id) {
        // 保留max_id，让客户端认为还有下一页
      }
    } else {
      obj.items = newItems;
    }
  }

  console.log(`[北京严格过滤] ✅ 广告移除:${removedAd} | 非北京主评论移除:${removedNonBj} | 保留北京主评论:${kept}`);
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`[北京严格过滤] 错误: ${e}`);
  $done({ body });
}
