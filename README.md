# 小红书账号内容管理

> chenruixuan 的小红书账号内容中心
> 账号定位：产品经理职场成长 | 从生活洞察到职场方法论

---

## 🚀 核心系统

### 自动化数据同步（新功能！）

**工作流程：**
```
点击Chrome插件 → 自动完成所有后续步骤 ✅
```

**特性：**
- ✅ 文件监听：自动检测下载的数据文件
- ✅ 自动同步：移动文件 + 数据分析 + Markdown更新
- ✅ 系统通知：完成后发送通知
- ✅ 历史归档：自动保存历史数据用于对比

**快速开始：**
```bash
# 启动监听（只需1次，后台持续运行）
cd ~/ai学习/.codeflicker/xiaohongshu-account
screen -S xhs-watch
npm run watch
Ctrl+A 然后 D

# 之后只需点击Chrome插件，自动完成所有操作！
```

**详细说明：** [查看完整使用手册](./USER-GUIDE.md)

---

## 📂 文件结构

### 内容管理文档
| 文件 | 功能 | 更新方式 |
|------|------|----------|
| [account-positioning.md](./account-positioning.md) | 账号定位、目标人群、内容方向 | 手动编辑 + 自动更新数据 |
| [content-database.md](./content-database.md) | 内容数据库、数据分析、爆款识别 | **自动更新** |
| [writing-style.md](./writing-style.md) | 写作风格指南、技巧、流程 | 手动编辑 |
| [topic-ideas.md](./topic-ideas.md) | 选题库、待开发选题 | 手动编辑 |

### 技术文件
| 文件/目录 | 功能 |
|-----------|------|
| [extension/](./extension/) | Chrome插件，抓取创作者中心数据 |
| [scripts/](./scripts/) | Node.js脚本，数据分析和同步 |
| [handlers/](./handlers/) | 文件处理器，自动化处理逻辑 |
| [data/](./data/) | 数据存储，最新数据和历史归档 |

### 使用文档
| 文件 | 功能 |
|------|------|
| [USER-GUIDE.md](./USER-GUIDE.md) | **完整使用手册**（安装、使用、常见问题） |
| [extension/README.md](./extension/README.md) | 插件安装说明 |

---

## 🎯 快速导航

### 开始新内容时

1. **确定选题** → 查看 `topic-ideas.md`
2. **理解定位** → 查看 `account-positioning.md`
3. **学习风格** → 查看 `writing-style.md`
4. **同步数据** → 使用Chrome插件

### 查看数据表现

1. **详细数据** → 查看 `content-database.md`
2. **账号概览** → 查看 `account-positioning.md`
3. **爆款分析** → 在 `content-database.md` 的"数据分析"章节

---

## 📊 内容概览

### 已发布内容
- **总数：** 2篇
- **最新：** AI抢不走的能力：Taste (2026-04-14)

### 待开发选题
- **职场方法论：** 10+ 个选题
- **产品思维：** 8+ 个选题
- **生活洞察：** 6+ 个选题
- **个人成长：** 6+ 个选题

---

## ✍️ 内容创作流程

### Step 1: 选题确认
- 从 `topic-ideas.md` 选择选题
- 或新增选题到选题库

### Step 2: 背景分析
- 为什么写这个？
- 目标读者是谁？
- 他们的痛点是什么？

### Step 3: 素材收集
- 真实场景/故事
- 案例/数据
- 个人经历

### Step 4: 结构设计
- 开头：痛点/故事/观察
- 中间：观点+方法
- 结尾：总结+行动指引

### Step 5: 撰写润色
- 参考 `writing-style.md`
- 用 natural-writing-style 风格
- 短句、口语化、有画面感

### Step 6: 发布记录
- 使用Chrome插件同步数据
- 系统自动更新所有文档

---

## 📈 内容迭代计划

### 每周
- [ ] 新增3个选题到 `topic-ideas.md`
- [ ] 发布1-2篇内容
- [ ] 同步数据并分析表现

### 每月
- [ ] Review 选题质量
- [ ] 分析数据表现
- [ ] 复盘优化方向

---

## 💡 关键原则

**内容创作：**
- 从真实场景出发
- 给出可落地的方法
- 表达自然不AI

**账号运营：**
- 持续积累内容数据
- 根据反馈调整方向
- 保持更新频率

---

## 🔧 快捷命令

```bash
# 启动文件监听（自动化系统）
npm run watch

# 手动同步数据
npm run sync

# 使用示例数据测试
cp data/data-sync-example.json data/data-sync-latest.json && npm run sync
```

---

## 🔗 相关资源

- **写作风格基础：** `.codeflicker/skills/natural-writing-style.md`
- **使用手册：** [USER-GUIDE.md](./USER-GUIDE.md)
- **插件文档：** [extension/README.md](./extension/README.md)

---

## 📝 更新记录

- **2026-04-15**：新增自动化数据同步系统
  - 文件监听守护进程
  - 自动数据分析和Markdown更新
  - 系统通知功能
  - 历史数据归档
- **2026-04-14**：创建小红书账号内容管理体系
  - 账号定位文档
  - 写作风格指南
  - 内容数据库
  - 选题库

---

**遇到问题？** 查看 [USER-GUIDE.md](./USER-GUIDE.md) 获取完整帮助！
