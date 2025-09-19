// API配置工具 - 根据环境自动选择API调用方式
export const isProduction = process.env.NODE_ENV === 'production';
export const isNetlifyProduction = process.env.NETLIFY === 'true';

// API端点配置
export const API_ENDPOINTS = {
  // 新闻API
  news: isNetlifyProduction 
    ? '/.netlify/functions/news' 
    : '/api/news-proxy',
    
  // 股票API  
  stocks: isNetlifyProduction 
    ? '/.netlify/functions/stocks' 
    : '/api/stocks-proxy',
    
  // 汇率API
  exchange: isNetlifyProduction 
    ? '/.netlify/functions/exchange' 
    : '/api/exchange-proxy',
    
  // 翻译API
  translate: isNetlifyProduction 
    ? '/.netlify/functions/translate' 
    : '/api/translate-proxy'
};

// 检查是否有API密钥可用（仅本地开发环境）
export const hasApiKeys = () => {
  if (isNetlifyProduction) return true; // 生产环境假设配置正确
  
  return !!(
    process.env.REACT_APP_NEWS_API_KEY &&
    process.env.REACT_APP_TIINGO_API_TOKEN &&
    process.env.REACT_APP_EXCHANGE_API_KEY &&
    process.env.REACT_APP_DOUBAO_API_KEY
  );
};

console.log('API配置:', {
  isProduction,
  isNetlifyProduction,
  hasApiKeys: hasApiKeys(),
  endpoints: API_ENDPOINTS
});