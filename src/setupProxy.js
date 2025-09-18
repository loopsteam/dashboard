const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Tiingo API代理
  app.use(
    '/api/tiingo',
    createProxyMiddleware({
      target: 'https://api.tiingo.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/tiingo': '/tiingo'
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('代理请求:', req.url);
      },
      onError: function (err, req, res) {
        console.error('代理错误:', err);
      }
    })
  );
  
  // 汇率API代理 - 使用新的ExchangeRate API
  app.use(
    '/api/exchange',
    createProxyMiddleware({
      target: 'https://v6.exchangerate-api.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api/exchange': '/v6/a1baf415a8a97cf7d8182e3f'
      },
      onProxyReq: function (proxyReq, req, res) {
        console.log('汇率API代理请求:', req.url);
      },
      onError: function (err, req, res) {
        console.error('汇率API代理错误:', err);
      }
    })
  );
};