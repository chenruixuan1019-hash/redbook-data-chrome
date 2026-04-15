// 小红书创作者中心数据抓取脚本

// DOM选择器配置（需要根据实际页面结构调整）
const SELECTORS = {
  // 表格行选择器
  tableRow: 'table tbody tr',
  
  // 笔记基础信息
  noteInfo: 'td:nth-child(1)',
  title: '.note-title, .title',  // 标题
  publishTime: '.publish-time, .time',  // 发布时间
  
  // 数据指标（根据实际列顺序调整）
  exposure: 'td:nth-child(2)',      // 曝光
  views: 'td:nth-child(3)',          // 观看
  clickRate: 'td:nth-child(4)',      // 封面点击率
  likes: 'td:nth-child(5)',          // 点赞
  comments: 'td:nth-child(6)',       // 评论
  collects: 'td:nth-child(7)',       // 收藏
  newFollowers: 'td:nth-child(8)',   // 涨粉
  shares: 'td:nth-child(9)',         // 分享
  avgViewTime: 'td:nth-child(10)',   // 人均观看时长
  danmu: 'td:nth-child(11)'          // 弹幕
};

/**
 * 解析笔记数据表格
 */
function parseNoteData() {
  console.log('开始解析笔记数据...');
  
  const notes = [];
  const rows = document.querySelectorAll(SELECTORS.tableRow);
  
  console.log(`找到 ${rows.length} 行数据`);
  
  if (rows.length === 0) {
    throw new Error('未找到笔记数据表格，请确保在正确的页面');
  }
  
  rows.forEach((row, index) => {
    try {
      // 提取笔记信息
      const noteInfoCell = row.querySelector(SELECTORS.noteInfo);
      const title = extractText(noteInfoCell, SELECTORS.title);
      const publishTime = extractText(noteInfoCell, SELECTORS.publishTime);
      
      // 如果没有标题，跳过这一行（可能是表头或空行）
      if (!title) {
        console.log(`跳过第 ${index + 1} 行：没有标题`);
        return;
      }
      
      // 提取数据指标
      const note = {
        title: title,
        publishTime: publishTime,
        metrics: {
          exposure: extractNumber(row, SELECTORS.exposure),
          views: extractNumber(row, SELECTORS.views),
          clickRate: extractText(row, SELECTORS.clickRate),
          likes: extractNumber(row, SELECTORS.likes),
          comments: extractNumber(row, SELECTORS.comments),
          collects: extractNumber(row, SELECTORS.collects),
          newFollowers: extractNumber(row, SELECTORS.newFollowers),
          shares: extractNumber(row, SELECTORS.shares),
          avgViewTime: extractText(row, SELECTORS.avgViewTime),
          danmu: extractNumber(row, SELECTORS.danmu)
        }
      };
      
      notes.push(note);
      console.log(`成功解析第 ${index + 1} 条笔记: ${title}`);
    } catch (error) {
      console.error(`解析第 ${index + 1} 行数据时出错:`, error);
    }
  });
  
  return {
    syncTime: new Date().toISOString(),
    notes: notes,
    metadata: {
      totalNotes: notes.length,
      extractedAt: new Date().toLocaleString('zh-CN'),
      pageUrl: window.location.href
    }
  };
}

/**
 * 从元素中提取文本
 */
function extractText(parentElement, selector) {
  if (!parentElement) return '';
  
  // 如果selector是多个，尝试每一个
  const selectors = selector.split(',').map(s => s.trim());
  
  for (const sel of selectors) {
    const el = parentElement.querySelector(sel);
    if (el && el.textContent.trim()) {
      return el.textContent.trim();
    }
  }
  
  // 如果没有找到子元素，尝试直接从父元素获取文本
  return parentElement.textContent.trim();
}

/**
 * 从元素中提取数字（处理逗号、空格等）
 */
function extractNumber(parentElement, selector) {
  const text = extractText(parentElement, selector);
  
  // 移除逗号、空格等，只保留数字
  const numberStr = text.replace(/[,\s]/g, '');
  const number = parseInt(numberStr);
  
  return isNaN(number) ? 0 : number;
}

/**
 * 导出数据为JSON文件
 */
function exportData(data) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  // 生成文件名（包含时间戳）
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `xiaohongshu-data-${timestamp}.json`;
  
  // 创建下载链接
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  // 清理URL对象
  setTimeout(() => URL.revokeObjectURL(url), 100);
  
  console.log(`数据已导出为: ${filename}`);
}

/**
 * 监听来自popup的消息
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('收到消息:', request);
  
  if (request.action === 'extractData') {
    try {
      // 解析数据
      const data = parseNoteData();
      
      // 导出JSON文件
      exportData(data);
      
      // 返回成功响应
      sendResponse({ 
        success: true, 
        count: data.notes.length,
        message: '数据抓取成功'
      });
    } catch (error) {
      console.error('数据抓取失败:', error);
      sendResponse({ 
        success: false, 
        error: error.message 
      });
    }
  }
  
  // 必须返回true以保持消息通道打开
  return true;
});

console.log('小红书数据同步助手已加载');
