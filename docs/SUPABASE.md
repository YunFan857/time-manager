# Supabase 集成指南

## 1. 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目名称和数据库密码
4. 选择离你最近的区域
5. 等待项目创建完成（约 2 分钟）

## 2. 运行数据库 Schema

1. 进入项目 Dashboard
2. 点击左侧 "SQL Editor"
3. 点击 "New Query"
4. 复制 `supabase/schema.sql` 的内容并粘贴
5. 点击 "Run" 执行

## 3. 获取 API 凭据

1. 点击左侧 "Settings" → "API"
2. 复制以下值：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 4. 配置环境变量

编辑 `.env.local`：

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 5. 配置 OAuth（可选）

如需第三方登录（GitHub/Google 等）：

1. Settings → Authentication → Providers
2. 启用想要的提供商
3. 配置 Client ID 和 Client Secret

## 6. 部署到 Cloudflare Pages

在 Cloudflare Dashboard 设置环境变量：

1. 进入项目 Settings → Environment Variables
2. 添加生产环境和预览环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 功能说明

- **未配置 Supabase**：使用 localStorage 存储（本地数据）
- **已配置 Supabase + 未登录**：使用 localStorage 存储
- **已配置 Supabase + 已登录**：数据存储到云端，支持多设备同步

## 数据库结构

### schedules 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| title | text | 标题 |
| description | text | 描述 |
| start_time | text | 开始时间 |
| end_time | text | 结束时间 |
| category | text | 分类 |
| date | date | 日期 |

### daily_intents 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | uuid | 主键 |
| user_id | uuid | 用户 ID |
| content | text | 意图内容 |
| date | date | 日期 |