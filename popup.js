document.getElementById('syncBtn').addEventListener('click', async () => {
  const syncBtn = document.getElementById('syncBtn');
  const statusEl = document.getElementById('status');
  
  // 禁用按钮
  syncBtn.disabled = true;
  syncBtn.querySelector('.button-text').textContent = '正在抓取...';
  
  // 显示加载状态
  statusEl.className = 'status loading';
  statusEl.textContent = '⏳ 正在解析页面数据...';
  statusEl.classList.remove('hidden');
  
  try {
    // 获取当前活动标签页
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // 检查是否在创作者中心页面
    if (!tab.url.includes('creator.xiaohongshu.com')) {
      throw new Error('请先打开小红书创作者中心页面');
    }
    
    // 发送消息给content script
    chrome.tabs.sendMessage(tab.id, { action: 'extractData' }, (response) => {
      if (chrome.runtime.lastError) {
        // 处理错误（可能是页面还没有加载content script）
        statusEl.className = 'status error';
        statusEl.textContent = '❌ 抓取失败：请刷新页面后重试';
        resetButton();
        return;
      }
      
      if (response && response.success) {
        statusEl.className = 'status success';
        statusEl.textContent = `✅ 成功抓取 ${response.count} 条笔记数据！请查看下载的JSON文件`;
      } else {
        statusEl.className = 'status error';
        statusEl.textContent = `❌ 抓取失败：${response.error || '未知错误'}`;
      }
      
      resetButton();
    });
  } catch (error) {
    statusEl.className = 'status error';
    statusEl.textContent = `❌ ${error.message}`;
    resetButton();
  }
  
  function resetButton() {
    syncBtn.disabled = false;
    syncBtn.querySelector('.button-text').textContent = '开始同步';
  }
});
