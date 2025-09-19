const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('Setting up development proxies with secure API key handling...');
  
  // 新闻API代理 - 本地开发环境
  app.use(
    '/api/news-proxy',
    createProxyMiddleware({
      target: 'https://newsapi.org',
      changeOrigin: true,
      timeout: 30000, // 30秒超时
      proxyTimeout: 30000,
      pathRewrite: (path, req) => {
        const apiKey = process.env.REACT_APP_NEWS_API_KEY;
        const { country = 'us', category = 'business', pageSize = '20' } = req.query;
        return `/v2/top-headlines?country=${country}&category=${category}&pageSize=${pageSize}&apiKey=${apiKey}`;
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('News API Proxy:', req.url.replace(process.env.REACT_APP_NEWS_API_KEY || '', '***'));
        // 添加用户代理
        proxyReq.setHeader('User-Agent', 'News-Stocks-Dashboard/1.0');
      },
      onError: function (err, req, res) {
        console.error('News API Proxy Error:', err.message);
        res.status(500).json({ 
          error: '新闻API请求失败', 
          message: err.message,
          code: err.code 
        });
      }
    })
  );
  
  // 股票API代理
  app.use(
    '/api/stocks-proxy',
    createProxyMiddleware({
      target: 'https://api.tiingo.com',
      changeOrigin: true,
      timeout: 20000, // 20秒超时
      proxyTimeout: 20000,
      pathRewrite: (path, req) => {
        const apiToken = process.env.REACT_APP_TIINGO_API_TOKEN;
        const cleanPath = path.replace('/api/stocks-proxy', '');
        const queryString = new URLSearchParams(req.query);
        queryString.set('token', apiToken);
        return `/tiingo${cleanPath}?${queryString.toString()}`;
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Stocks API Proxy:', req.url.replace(process.env.REACT_APP_TIINGO_API_TOKEN || '', '***'));
        proxyReq.setHeader('User-Agent', 'News-Stocks-Dashboard/1.0');
      },
      onError: function (err, req, res) {
        console.error('Stocks API Proxy Error:', err.message);
        res.status(500).json({ 
          error: '股票API请求失败', 
          message: err.message,
          code: err.code 
        });
      }
    })
  );
  
  // 汇率API代理
  app.use(
    '/api/exchange-proxy',
    createProxyMiddleware({
      target: 'https://v6.exchangerate-api.com',
      changeOrigin: true,
      timeout: 20000, // 20秒超时
      proxyTimeout: 20000,
      pathRewrite: (path, req) => {
        const apiKey = process.env.REACT_APP_EXCHANGE_API_KEY;
        const cleanPath = path.replace('/api/exchange-proxy', '');
        return `/v6/${apiKey}${cleanPath}`;
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('Exchange API Proxy:', req.url.replace(process.env.REACT_APP_EXCHANGE_API_KEY || '', '***'));
        proxyReq.setHeader('User-Agent', 'News-Stocks-Dashboard/1.0');
      },
      onError: function (err, req, res) {
        console.error('Exchange API Proxy Error:', err.message);
        res.status(500).json({ 
          error: '汇率API请求失败', 
          message: err.message,
          code: err.code 
        });
      }
    })
  );
  
  // 翻译API代理
  app.use(
    '/api/translate-proxy',
    createProxyMiddleware({
      target: 'https://ark.cn-beijing.volces.com',
      changeOrigin: true,
      timeout: 20000, // 20秒超时
      proxyTimeout: 20000,
      pathRewrite: {
        '^/api/translate-proxy': '/api/v3/chat/completions'
      },
      onProxyReq: function (proxyReq, req, res) {
        // 添加Authorization头
        const apiKey = process.env.REACT_APP_DOUBAO_API_KEY;
        if (apiKey && req.method === 'POST') {
          proxyReq.setHeader('Authorization', `Bearer ${apiKey}`);
          proxyReq.setHeader('Content-Type', 'application/json');
          proxyReq.setHeader('User-Agent', 'News-Stocks-Dashboard/1.0');
        }
        console.log('Translate API Proxy request');
      },
      onError: function (err, req, res) {
        console.error('Translate API Proxy Error:', err.message);
        res.status(500).json({ 
          error: '翻译API请求失败', 
          message: err.message,
          code: err.code 
        });
      }
    })
  );
  
  console.log('Development proxies configured successfully');
};