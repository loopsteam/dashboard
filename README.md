# Trae Dashboard

现代化的信息仪表板，汇聚全球新闻与股市动态。

## 环境配置

在运行项目之前，请按照以下步骤配置API密钥：

### 1. 复制环境变量模板
```bash
cp .env.example .env
```

### 2. 配置API密钥

编辑 `.env` 文件，填入你的API密钥：

```env
# 新闻API配置
REACT_APP_NEWS_API_KEY=your_newsapi_key_here

# 股票数据API配置  
REACT_APP_TIINGO_API_TOKEN=your_tiingo_token_here

# 汇率API配置
REACT_APP_EXCHANGE_API_KEY=your_exchange_api_key_here
```

### 3. 获取API密钥

#### NewsAPI (新闻数据)
1. 访问 [NewsAPI](https://newsapi.org/)
2. 注册账户并获取免费API密钥
3. 将密钥填入 `REACT_APP_NEWS_API_KEY`

#### Tiingo API (股票数据)
1. 访问 [Tiingo](https://api.tiingo.com/)
2. 注册账户并获取免费API令牌
3. 将令牌填入 `REACT_APP_TIINGO_API_TOKEN`

#### ExchangeRate-API (汇率数据)
1. 访问 [ExchangeRate-API](https://www.exchangerate-api.com/)
2. 注册账户并获取免费API密钥
3. 将密钥填入 `REACT_APP_EXCHANGE_API_KEY`

## 运行项目

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start
```

## 功能特性

- 📰 实时新闻：获取最新的美国商业新闻
- 📈 股市行情：追踪SPX和NDX指数数据
- 💱 实时汇率：显示USD→CNY、CNY→JPY、CNY→KRW汇率
- 🎨 现代化UI：暗色主题 + 流畅动画
- 💾 智能缓存：减少API请求，提升性能

## 技术栈

- React 18.2.0 + TypeScript
- Framer Motion (动画)
- Axios (HTTP客户端)
- Lucide React (图标)
- Create React App (构建工具)