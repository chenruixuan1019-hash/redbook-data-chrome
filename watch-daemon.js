/**
 * 文件监听守护进程
 * 监听下载文件夹，自动处理匹配的文件
 */

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, '../watch-config.json');
const PROJECT_ROOT = path.join(__dirname, '..');

// 已处理文件缓存（避免重复处理）
const processedFiles = new Set();

// 当前监听状态
let isWatching = false;
let watchInterval = null;

/**
 * 加载配置
 */
async function loadConfig() {
  try {
    const config = await fs.readJSON(CONFIG_PATH);
    
    // 展开用户目录
    config.watchDir = config.watchDir.replace(/^~/, os.homedir());
    
    return config;
  } catch (error) {
    console.error('❌ 加载配置文件失败:', error.message);
    process.exit(1);
  }
}

/**
 * 加载处理器
 */
function loadHandler(handlerName) {
  try {
    const HandlerClass = require(`../handlers/${handlerName}.js`);
    return HandlerClass;
  } catch (error) {
    console.error(`❌ 加载处理器失败: ${handlerName}`, error.message);
    return null;
  }
}

/**
 * 发送系统通知
 */
function sendNotification(title, message, isError = false) {
  const icon = isError ? '❌' : '✅';
  const displayMessage = `${icon} ${message}`;
  
  // macOS通知
  if (process.platform === 'darwin') {
    const script = `display notification "${message}" with title "${title}"`;
    exec(`osascript -e '${script}'`);
  }
  
  console.log(`\n${icon} ${title}: ${message}\n`);
}

/**
 * 扫描目录，查找匹配的文件
 */
async function scanDirectory(config) {
  try {
    const files = await fs.readdir(config.watchDir);
    
    for (const filename of files) {
      const filePath = path.join(config.watchDir, filename);
      
      // 跳过已处理的文件
      if (processedFiles.has(filePath)) {
        continue;
      }
      
      // 检查是否是文件
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        continue;
      }
      
      // 检查文件是否完全写入（等待1秒后文件大小不变）
      const size1 = stats.size;
      await sleep(1000);
      const stats2 = await fs.stat(filePath);
      if (size1 !== stats2.size) {
        continue; // 文件还在写入中
      }
      
      // 匹配规则并处理
      for (const rule of config.rules) {
        if (!rule.enabled) continue;
        
        const HandlerClass = loadHandler(rule.handler);
        if (!HandlerClass) continue;
        
        const handler = new HandlerClass(rule, PROJECT_ROOT);
        
        if (handler.match(filename)) {
          console.log(`\n🎯 检测到匹配文件: ${filename}`);
          console.log(`📋 规则: ${rule.name}`);
          
          // 标记为已处理（避免重复）
          processedFiles.add(filePath);
          
          try {
            const result = await handler.handle(filePath);
            
            if (config.notifications?.onSuccess) {
              sendNotification(
                rule.description || rule.name,
                result.message || '处理成功'
              );
            }
            
            // 如果配置了once，只处理一次后自动删除
            if (rule.once && rule.deleteAfterProcess) {
              // 文件已在handler中删除
            }
            
          } catch (error) {
            console.error(`❌ 处理文件失败: ${error.message}`);
            
            if (config.notifications?.onError) {
              sendNotification(
                rule.description || rule.name,
                `处理失败: ${error.message}`,
                true
              );
            }
            
            // 从已处理列表移除，允许重试
            processedFiles.delete(filePath);
          }
          
          break; // 找到匹配规则后跳出
        }
      }
    }
  } catch (error) {
    console.error('❌ 扫描目录失败:', error.message);
  }
}

/**
 * 睡眠函数
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 启动监听
 */
async function startWatching() {
  if (isWatching) {
    console.log('⚠️  监听已在运行中');
    return;
  }
  
  const config = await loadConfig();
  
  console.log('🚀 文件监听守护进程启动');
  console.log(`📂 监听目录: ${config.watchDir}`);
  console.log(`⏱️  扫描间隔: ${config.pollInterval}ms`);
  console.log(`📋 已启用规则: ${config.rules.filter(r => r.enabled).length}个\n`);
  
  config.rules.filter(r => r.enabled).forEach(rule => {
    console.log(`  ✓ ${rule.name}: ${rule.description || '无描述'}`);
  });
  
  console.log('\n⏳ 等待文件...\n');
  console.log('💡 提示: 按 Ctrl+C 停止监听\n');
  
  isWatching = true;
  
  // 定期扫描
  watchInterval = setInterval(async () => {
    await scanDirectory(config);
  }, config.pollInterval);
  
  // 立即执行一次
  await scanDirectory(config);
}

/**
 * 停止监听
 */
function stopWatching() {
  if (!isWatching) {
    console.log('⚠️  监听未运行');
    return;
  }
  
  if (watchInterval) {
    clearInterval(watchInterval);
    watchInterval = null;
  }
  
  isWatching = false;
  console.log('\n👋 监听已停止');
  process.exit(0);
}

/**
 * 显示状态
 */
function showStatus() {
  console.log(`监听状态: ${isWatching ? '🟢 运行中' : '🔴 已停止'}`);
  console.log(`已处理文件数: ${processedFiles.size}`);
}

// 处理退出信号
process.on('SIGINT', stopWatching);
process.on('SIGTERM', stopWatching);

// 启动监听
if (require.main === module) {
  startWatching().catch(error => {
    console.error('❌ 启动失败:', error);
    process.exit(1);
  });
}

module.exports = {
  startWatching,
  stopWatching,
  showStatus
};
