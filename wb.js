// Quantumult X - 微博仅保留北京主评论 + 移除所有广告
// 按你要求：只处理主评论，不处理子回复；广告全部删除

let body = $response.body;
if (!body) $done({});

try {
  let obj = JSON.parse(body);
  let kept = 0, removedAd = 0, removedNonBj = 0;

  if (obj?.items?.length > 0) {
    obj.items = obj.items.filter(item => {
      // 1. 彻底移除广告
      if (item.type === "trend" || 
          item.data?.is_ad === 1 || 
          (item.data?.mblogtype === 1 && item.data?.is_ad)) {
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
      
      if (loc.includes("北京")) {
        kept++;
        return true;   // 保留整个主评论 + 所有子回复
      } else {
        removedNonBj++;
        return false;  // 删除整个项
      }
    });
  }

  console.log(`[北京主评论过滤] ✅ 广告移除: ${removedAd} | 非北京主评论移除: ${removedNonBj} | 保留: ${kept}`);

  $done({ body: JSON.stringify(obj) });
} catch (e) {
  console.log(`[北京主评论过滤] 错误: ${e}`);
  $done({ body });
}
