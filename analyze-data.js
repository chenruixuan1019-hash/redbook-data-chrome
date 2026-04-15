/**
 * 数据分析模块
 * 负责分析小红书笔记数据，生成统计报告
 */

/**
 * 分析笔记数据
 * @param {Object} data - 从JSON文件读取的原始数据
 * @returns {Object} 分析结果
 */
function analyzeData(data) {
  const notes = data.notes || [];
  
  if (notes.length === 0) {
    return {
      totals: {},
      averages: {},
      topNotes: [],
      contentTypes: {},
      summary: '暂无数据'
    };
  }
  
  // 1. 计算总体指标
  const totals = calculateTotals(notes);
  
  // 2. 计算平均指标
  const averages = calculateAverages(notes, totals);
  
  // 3. 识别爆款内容
  const topNotes = identifyTopNotes(notes);
  
  // 4. 内容类型分类
  const contentTypes = categorizeNotes(notes);
  
  // 5. 生成数据摘要
  const summary = generateSummary(notes, totals, averages);
  
  return {
    totals,
    averages,
    topNotes,
    contentTypes,
    summary
  };
}

/**
 * 计算总体指标
 */
function calculateTotals(notes) {
  return {
    exposure: notes.reduce((sum, n) => sum + (n.metrics.exposure || 0), 0),
    views: notes.reduce((sum, n) => sum + (n.metrics.views || 0), 0),
    likes: notes.reduce((sum, n) => sum + (n.metrics.likes || 0), 0),
    collects: notes.reduce((sum, n) => sum + (n.metrics.collects || 0), 0),
    comments: notes.reduce((sum, n) => sum + (n.metrics.comments || 0), 0),
    newFollowers: notes.reduce((sum, n) => sum + (n.metrics.newFollowers || 0), 0),
    shares: notes.reduce((sum, n) => sum + (n.metrics.shares || 0), 0)
  };
}

/**
 * 计算平均指标
 */
function calculateAverages(notes, totals) {
  const count = notes.length;
  
  return {
    exposure: Math.round(totals.exposure / count),
    views: Math.round(totals.views / count),
    clickRate: totals.exposure > 0 
      ? ((totals.views / totals.exposure) * 100).toFixed(2) + '%'
      : '0%',
    likes: Math.round(totals.likes / count),
    collects: Math.round(totals.collects / count),
    comments: Math.round(totals.comments / count),
    engagement: calculateEngagement(totals, count)
  };
}

/**
 * 计算互动率
 */
function calculateEngagement(totals, count) {
  const totalEngagement = totals.likes + totals.collects + totals.comments;
  const avgEngagement = Math.round(totalEngagement / count);
  
  return {
    total: totalEngagement,
    average: avgEngagement,
    rate: totals.views > 0 
      ? ((totalEngagement / totals.views) * 100).toFixed(2) + '%'
      : '0%'
  };
}

/**
 * 识别爆款内容
 * 规则：曝光 > 10000 或 点赞 > 50 或 收藏 > 30
 */
function identifyTopNotes(notes) {
  return notes
    .filter(n => 
      n.metrics.exposure > 10000 || 
      n.metrics.likes > 50 || 
      n.metrics.collects > 30
    )
    .sort((a, b) => b.metrics.exposure - a.metrics.exposure)
    .slice(0, 3)
    .map(note => ({
      ...note,
      score: calculateNoteScore(note)
    }));
}

/**
 * 计算笔记综合得分
 */
function calculateNoteScore(note) {
  const m = note.metrics;
  // 权重：曝光(0.3) + 点赞(0.25) + 收藏(0.25) + 评论(0.2)
  const score = 
    (m.exposure / 100) * 0.3 +
    m.likes * 0.25 +
    m.collects * 0.25 +
    m.comments * 0.2;
  
  return Math.round(score);
}

/**
 * 内容类型分类
 * 根据标题关键词自动分类
 */
function categorizeNotes(notes) {
  const categories = {
    '职场方法论': ['述职', '转正', '评审', '协作', '汇报', '跨部门', '向上', '管理'],
    '产品思维': ['需求', '产品', '用户', '设计', '功能', '方案', '价值', 'PM'],
    '生活洞察': ['买衣服', '租房', '咖啡', '餐厅', '旅行', '店主', '中介', '服务'],
    'AI相关': ['AI', 'Taste', '能力', '直觉', '算法', '模型', '技术'],
    '个人成长': ['成长', '学习', '能力', '思考', '方法', '技巧', '经验']
  };
  
  const result = {};
  const uncategorized = [];
  
  notes.forEach(note => {
    const title = note.title;
    let matched = false;
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => title.includes(kw))) {
        if (!result[category]) {
          result[category] = [];
        }
        result[category].push(note);
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      uncategorized.push(note);
    }
  });
  
  if (uncategorized.length > 0) {
    result['其他'] = uncategorized;
  }
  
  // 计算每个类型的平均指标
  for (const [category, categoryNotes] of Object.entries(result)) {
    const avgExposure = Math.round(
      categoryNotes.reduce((sum, n) => sum + n.metrics.exposure, 0) / categoryNotes.length
    );
    const avgEngagement = Math.round(
      categoryNotes.reduce((sum, n) => 
        sum + n.metrics.likes + n.metrics.collects + n.metrics.comments, 0
      ) / categoryNotes.length
    );
    
    result[category] = {
      notes: categoryNotes,
      count: categoryNotes.length,
      avgExposure,
      avgEngagement
    };
  }
  
  return result;
}

/**
 * 生成数据摘要
 */
function generateSummary(notes, totals, averages) {
  return {
    totalNotes: notes.length,
    totalExposure: totals.exposure.toLocaleString(),
    totalViews: totals.views.toLocaleString(),
    avgClickRate: averages.clickRate,
    totalEngagement: averages.engagement.total.toLocaleString(),
    avgEngagement: averages.engagement.average,
    engagementRate: averages.engagement.rate
  };
}

module.exports = {
  analyzeData
};
