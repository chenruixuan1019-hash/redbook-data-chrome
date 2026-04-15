/**
 * Markdown更新模块
 * 负责将分析结果更新到Markdown文件中
 */

const fs = require('fs-extra');
const path = require('path');

/**
 * 更新所有Markdown文件
 */
async function updateMarkdown(data, analysis, paths) {
  console.log('📝 开始更新Markdown文件...');
  
  // 更新 content-database.md
  await updateContentDatabase(data, analysis, paths.contentDB);
  console.log('✅ content-database.md 更新完成');
  
  // 更新 account-positioning.md
  await updateAccountPositioning(analysis, paths.accountPos);
  console.log('✅ account-positioning.md 更新完成');
}

/**
 * 更新内容数据库文档
 */
async function updateContentDatabase(data, analysis, filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  
  // 1. 更新数据表格
  const tableSection = generateDataTable(data.notes);
  content = replaceSection(content, 'DATA_TABLE', tableSection);
  
  // 2. 更新数据分析
  const analysisSection = generateAnalysisSection(analysis);
  content = replaceSection(content, 'ANALYSIS', analysisSection);
  
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 生成数据表格
 */
function generateDataTable(notes) {
  if (notes.length === 0) {
    return '暂无数据';
  }
  
  const tableHeader = `
| # | 标题 | 发布日期 | 曝光 | 观看 | 点击率 | 点赞 | 收藏 | 评论 | 涨粉 |
|---|------|---------|------|------|--------|------|------|------|------|`;
  
  const tableRows = notes.map((note, index) => {
    const m = note.metrics;
    return `| ${String(index + 1).padStart(2, '0')} | ${note.title} | ${note.publishTime} | ${m.exposure.toLocaleString()} | ${m.views.toLocaleString()} | ${m.clickRate} | ${m.likes} | ${m.collects} | ${m.comments} | ${m.newFollowers} |`;
  }).join('\n');
  
  return `${tableHeader}\n${tableRows}`;
}

/**
 * 生成分析内容
 */
function generateAnalysisSection(analysis) {
  const { topNotes, contentTypes, summary } = analysis;
  
  let section = '';
  
  // 爆款内容
  if (topNotes.length > 0) {
    section += '\n### 表现最好的内容\n\n';
    topNotes.forEach((note, i) => {
      const m = note.metrics;
      section += `${i + 1}. **${note.title}**\n`;
      section += `   - 曝光：${m.exposure.toLocaleString()} | 观看：${m.views.toLocaleString()} | 点击率：${m.clickRate}\n`;
      section += `   - 点赞：${m.likes} | 收藏：${m.collects} | 评论：${m.comments}\n`;
      if (m.newFollowers > 0) {
        section += `   - 涨粉：${m.newFollowers}\n`;
      }
      section += '\n';
    });
  }
  
  // 内容类型对比
  if (Object.keys(contentTypes).length > 0) {
    section += '### 内容类型对比\n\n';
    Object.entries(contentTypes).forEach(([type, data]) => {
      section += `- **${type}**：${data.count}篇，平均曝光 ${data.avgExposure.toLocaleString()}，平均互动 ${data.avgEngagement}\n`;
    });
    section += '\n';
  }
  
  // 数据摘要
  section += '### 数据摘要\n\n';
  section += `- 笔记总数：${summary.totalNotes}\n`;
  section += `- 总曝光：${summary.totalExposure}\n`;
  section += `- 总观看：${summary.totalViews}\n`;
  section += `- 平均点击率：${summary.avgClickRate}\n`;
  section += `- 总互动：${summary.totalEngagement}（平均 ${summary.avgEngagement}/篇）\n`;
  section += `- 互动率：${summary.engagementRate}\n`;
  
  return section;
}

/**
 * 更新账号定位文档
 */
async function updateAccountPositioning(analysis, filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  
  const dataSection = generateAccountDataSection(analysis);
  content = replaceSection(content, 'ACCOUNT_DATA', dataSection);
  
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 生成账号数据部分
 */
function generateAccountDataSection(analysis) {
  const { summary, topNotes, contentTypes } = analysis;
  
  let section = '';
  
  // 账号数据概览
  section += `\n## 📊 账号数据（更新时间：${new Date().toLocaleString('zh-CN')}）\n\n`;
  section += `- 笔记数：${summary.totalNotes}\n`;
  section += `- 总曝光：${summary.totalExposure}\n`;
  section += `- 总观看：${summary.totalViews}\n`;
  section += `- 平均点击率：${summary.avgClickRate}\n`;
  section += `- 总互动：${summary.totalEngagement}\n`;
  section += `- 互动率：${summary.engagementRate}\n\n`;
  
  // 爆款内容TOP3
  if (topNotes.length > 0) {
    section += '## 🔥 爆款内容TOP3\n\n';
    topNotes.forEach((note, i) => {
      const m = note.metrics;
      section += `${i + 1}. **${note.title}**\n`;
      section += `   - 曝光：${m.exposure.toLocaleString()} | 观看：${m.views.toLocaleString()} | 点击率：${m.clickRate}\n`;
      section += `   - 点赞：${m.likes} | 收藏：${m.collects} | 评论：${m.comments}\n`;
      if (m.newFollowers > 0) {
        section += `   - 涨粉：${m.newFollowers}\n`;
      }
      section += '\n';
    });
  }
  
  // 内容类型分布
  if (Object.keys(contentTypes).length > 0) {
    section += '## 📈 内容类型分布\n\n';
    Object.entries(contentTypes)
      .sort((a, b) => b[1].avgExposure - a[1].avgExposure)
      .forEach(([type, data]) => {
        section += `- **${type}**：${data.count}篇，平均曝光 ${data.avgExposure.toLocaleString()}\n`;
      });
  }
  
  return section;
}

/**
 * 替换Markdown中的标记区域
 */
function replaceSection(content, sectionName, newContent) {
  const startMarker = `<!-- ${sectionName}_START -->`;
  const endMarker = `<!-- ${sectionName}_END -->`;
  
  const regex = new RegExp(
    `${escapeRegex(startMarker)}[\\s\\S]*?${escapeRegex(endMarker)}`,
    'g'
  );
  
  return content.replace(
    regex,
    `${startMarker}\n${newContent}\n${endMarker}`
  );
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  updateMarkdown
};
