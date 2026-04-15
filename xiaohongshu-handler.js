/**
 * 小红书数据处理器
 * 处理从Chrome插件下载的小红书数据文件
 */

const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class XiaohongshuHandler {
  constructor(config, projectRoot) {
    this.config = config;
    this.projectRoot = projectRoot;
    this.targetFile = path.join(projectRoot, 'data/data-sync-latest.json');
    this.syncScript = path.join(projectRoot, 'scripts/sync-data.js');
  }

  /**
   * 判断文件是否匹配
   */
  match(filename) {
    const pattern = new RegExp(this.config.pattern);
    return pattern.test(filename);
  }

  /**
   * 处理文件
   */
  async handle(filePath) {
    console.log(`\n🔄 开始处理小红书数据文件: ${path.basename(filePath)}`);
    
    try {
      // 1. 验证JSON格式
      console.log('📋 验证文件格式...');
      const data = await fs.readJSON(filePath);
      
      if (!data.notes || !Array.isArray(data.notes)) {
        throw new Error('文件格式错误：缺少 notes 字段');
      }
      
      console.log(`✅ 文件有效，包含 ${data.notes.length} 条笔记数据`);
      
      // 2. 移动文件到目标位置
      console.log(`📁 移动文件到: ${this.targetFile}`);
      await fs.copy(filePath, this.targetFile);
      console.log('✅ 文件移动成功');
      
      // 3. 运行同步脚本
      console.log('🚀 开始运行数据同步...');
      const { stdout, stderr } = await execAsync(
        `cd "${this.projectRoot}" && npm run sync`,
        { maxBuffer: 1024 * 1024 }
      );
      
      if (stderr && !stderr.includes('npm notice')) {
        console.error('⚠️ 同步过程中的警告:', stderr);
      }
      
      console.log(stdout);
      
      // 4. 删除源文件（如果配置了deleteAfterProcess）
      if (this.config.deleteAfterProcess) {
        await fs.remove(filePath);
        console.log('🗑️  已删除下载文件');
      }
      
      return {
        success: true,
        message: `成功处理 ${data.notes.length} 条笔记数据`,
        notesCount: data.notes.length
      };
      
    } catch (error) {
      console.error('❌ 处理失败:', error.message);
      throw error;
    }
  }

  /**
   * 清理操作
   */
  async cleanup() {
    // 可以在这里做一些清理工作
  }
}

module.exports = XiaohongshuHandler;
