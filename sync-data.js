/**
 * 小红书数据同步主脚本
 * 读取JSON数据，分析并更新Markdown文件
 */

const fs = require('fs-extra');
const path = require('path');
const { analyzeData } = require('./analyze-data');
const { updateMarkdown } = require('./update-markdown');

// 配置路径
const PATHS = {
  dataDir: path.join(__dirname, '../data'),
  latestData: path.join(__dirname, '../data/data-sync-latest.json'),
  historyDir: path.join(__dirname, '../data/history'),
  contentDB: path.join(__dirname, '../content-database.md'),
  accountPos: path.join(__dirname, '../account-positioning.md')
};

/**
 * 主函数
 */
async function main() {
  console.log('🚀 小红书数据同步开始...\n');
  
  try {
    // 1. 检查数据文件是否存在
    if (!await fs.pathExists(PATHS.latestData)) {
      throw new Error(`数据文件不存在: ${PATHS.latestData}\n请先使用Chrome插件抓取数据`);
    }
    
    // 2. 读取最新数据
    console.log('📖 读取数据文件...');
    const data = await fs.readJSON(PATHS.latestData);
    console.log(`✅ 成功读取 ${data.notes.length} 条笔记数据\n`);
    
    // 验证数据格式
    if (!data.notes || !Array.isArray(data.notes)) {
      throw new Error('数据格式错误：缺少 notes 字段');
    }
    
    // 3. 数据分析
    console.log('📊 分析数据...');
    const analysis = analyzeData(data);
    console.log(`✅ 分析完成`);
    console.log(`   - 总曝光：${analysis.summary.totalExposure}`);
    console.log(`   - 总观看：${analysis.summary.totalViews}`);
    console.log(`   - 平均点击率：${analysis.summary.avgClickRate}`);
    console.log(`   - 识别到 ${analysis.topNotes.length} 篇爆款内容\n`);
    
    // 4. 更新Markdown文件
    console.log('📝 更新Markdown文件...');
    await updateMarkdown(data, analysis, PATHS);
    console.log(`✅ Markdown更新完成\n`);
    
    // 5. 归档数据
    console.log('💾 归档数据...');
    await archiveData(data);
    console.log(`✅ 数据已归档\n`);
    
    // 6. 完成
    console.log('🎉 同步完成！');
    console.log(`\n📄 查看更新后的文件：`);
    console.log(`   - ${PATHS.contentDB}`);
    console.log(`   - ${PATHS.accountPos}`);
    
  } catch (error) {
    console.error('❌ 同步失败:', error.message);
    console.error('\n💡 可能的原因：');
    console.error('   1. 数据文件不存在或格式错误');
    console.error('   2. Markdown文件缺少标记区域');
    console.error('   3. 文件权限问题');
    console.error('\n请检查错误信息并重试。');
    process.exit(1);
  }
}

/**
 * 归档数据到历史目录
 */
async function archiveData(data) {
  // 确保历史目录存在
  await fs.ensureDir(PATHS.historyDir);
  
  // 生成归档文件名（按日期）
  const today = new Date().toISOString().split('T')[0];
  const archivePath = path.join(PATHS.historyDir, `${today}.json`);
  
  // 如果今天已经有归档文件，添加时间戳
  let finalPath = archivePath;
  if (await fs.pathExists(archivePath)) {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    finalPath = path.join(PATHS.historyDir, `${today}_${timestamp}.json`);
  }
  
  // 复制数据文件到历史目录
  await fs.writeJSON(finalPath, data, { spaces: 2 });
  
  console.log(`   归档位置：${finalPath}`);
}

/**
 * 清理历史数据（保留最近30天）
 */
async function cleanupHistory() {
  const files = await fs.readdir(PATHS.historyDir);
  const now = Date.now();
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
  
  for (const file of files) {
    const filePath = path.join(PATHS.historyDir, file);
    const stats = await fs.stat(filePath);
    
    if (stats.mtimeMs < thirtyDaysAgo) {
      await fs.remove(filePath);
      console.log(`   删除旧数据：${file}`);
    }
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main };
