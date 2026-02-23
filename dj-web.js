// === 抖音网页版【严格只保留北京主评论】 v3.0 - 强制隐藏非北京 ===
(() => {
  console.log('%c[抖音北京过滤 v3] 启动 - 只保留明确北京，其余全藏 ✅', 'color:#00ff00;font-size:14px;font-weight:bold');

  let stats = { kept: 0, hidden: 0, scanned: 0, suspectedLoc: [] };

  function extractLocation(text) {
    if (!text) return '';
    text = text.trim().toLowerCase();
    // 常见变体（忽略大小写、空格、标点）
    const beijingPatterns = [
      /北京/i,
      /beijing/i,
      /bj/i,  // 偶尔缩写
      /ip.*北京/i,
      /属地.*北京/i,
      /所在地.*北京/i
    ];
    for (let pat of beijingPatterns) {
      if (pat.test(text)) return '北京';
    }
    // 如果有其他城市，记录但不保留
    if (/上海|广东|江苏|浙江|山东|河南|四川/i.test(text)) {
      return '其他城市';
    }
    return '';
  }

  function isLikelyMainComment(el) {
    // 主评论通常有用户名 + 时间 + IP小标签 + 回复按钮等，子回复嵌套更深
    const depth = el.querySelectorAll('div').length;
    return depth > 8 || el.textContent.includes('回复') || el.querySelector('[class*="reply"], [class*="sub"]');
  }

  function filterComments() {
    // 更宽泛 selector，覆盖抖音常见评论结构
    const items = document.querySelectorAll('div[class*="comment"], div[data-e2e*="comment"], .comment-item, .comment-wrapper div > div');

    let uniqueItems = [...new Set(Array.from(items))];
    stats.scanned += uniqueItems.length;

    uniqueItems.forEach(item => {
      const text = item.textContent || '';
      const html = item.innerHTML || '';

      // 跳过广告/推广
      if (html.includes('广告') || html.includes('推广') || html.includes('赞助')) {
        item.style.display = 'none';
        stats.hidden++;
        return;
      }

      // 尝试提取属地（优先找小标签区域）
      let loc = '';
      const possibleLocEls = item.querySelectorAll('span, div[class*="location"], div[class*="ip"], small, [class*="tag"], [class*="label"]');
      possibleLocEls.forEach(el => {
        const elText = el.textContent.trim();
        if (elText.length < 15 && (elText.includes('北京') || /[省 市 自治区]/.test(elText))) {
          loc = extractLocation(elText);
          if (loc) stats.suspectedLoc.push(elText);
        }
      });

      // 如果上面没找到，再全文本搜
      if (!loc) loc = extractLocation(text);

      if (loc === '北京') {
        item.style.display = '';
        stats.kept++;
        console.log(`%c[保留] 北京属地 → ${loc} | 文本预览: ${text.substring(0,60)}...`, 'color:#00ff88');
      } else {
        // 非北京主评论 → 隐藏整个块
        if (isLikelyMainComment(item) || loc === '其他城市') {
          item.style.display = 'none';
          stats.hidden++;
          if (loc) console.log(`%c[隐藏] ${loc} → ${text.substring(0,60)}...`, 'color:#ff6666');
        }
        // 子回复保持显示（即使父隐藏，子可能独立渲染）
      }
    });

    console.log(`%c[统计] 扫描: ${uniqueItems.length} | 保留北京: ${stats.kept} | 隐藏: ${stats.hidden}`, 'color:#ffaa00;font-weight:bold');
    if (stats.suspectedLoc.length > 0) {
      console.log(`%c[调试-疑似属地文本] ${stats.suspectedLoc.join(' | ')}`, 'color:#888');
    }
  }

  const run = () => { filterComments(); setTimeout(filterComments, 1000); };
  run();
  setInterval(run, 3000);

  // 观察新加载
  new MutationObserver(() => setTimeout(run, 800)).observe(document.body, { childList: true, subtree: true });

  window.beijingFilter = run;
  window.showLocDebug = () => console.log(stats.suspectedLoc);

  console.log('%c运行 beijingFilter() 手动刷新过滤 | showLocDebug() 查看捕获的属地文本', 'color:#aaa');
})();
