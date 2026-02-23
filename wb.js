// Quantumult X - 微博北京主评论过滤（已修复翻页bug）
// 特点：无北京评论时显示全部以继续翻页；有则只显示北京；广告全部移除

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
      const loc = (data.user?.location || "") + (data.source || "");

      if (loc.includes("来自北京")) {
        kept++;
        return true;   // 保留整个主评论（含所有子回复）
      } else {
        removedNonBj++;
        return false;
      }
    });

    // 【关键修复】如果本页过滤后完全为空，则不做过滤，返回原始数据，让客户端继续翻页
    if (newItems.length === 0 && obj.items.length > 0) {
      console.log(`[北京过滤] 本页无北京评论 → 返回原始数据，继续翻页`);
      $done({ body });
      return;
    }

    obj.items = newItems;
  }

  console.log(`[北京过滤] ✅ 广告移除:${removedAd} | 非北京主评论移除:${removedNonBj} | 保留北京:${kept}`);
  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`[北京过滤] 错误: ${e}`);
  $done({ body });
}
