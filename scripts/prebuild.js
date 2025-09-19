#!/usr/bin/env node

/**
 * 构建前脚本 - 确保生产构建不包含API密钥
 */

const fs = require('fs');
const path = require('path');

console.log('🔒 执行构建前安全检查...');

// 检查是否是生产构建
const isProduction = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY === 'true';

console.log('环境信息:', {
  NODE_ENV: process.env.NODE_ENV,
  NETLIFY: process.env.NETLIFY,
  isProduction,
  isNetlify
});

if (isProduction || isNetlify) {
  console.log('🚫 检测到生产环境构建，清理本地开发密钥...');
  
  // 创建临时的安全.env文件用于生产构建
  const safeEnvContent = `# 生产环境安全配置 - 构建时自动生成
# API密钥通过Netlify Functions处理，不在前端暴露

REACT_APP_ENVIRONMENT=production
REACT_APP_APP_NAME=News Stocks

# 禁用所有前端API密钥
# REACT_APP_NEWS_API_KEY=
# REACT_APP_TIINGO_API_TOKEN=
# REACT_APP_EXCHANGE_API_KEY=
# REACT_APP_DOUBAO_API_KEY=
`;

  // 备份原始.env文件
  const envPath = path.join(__dirname, '../.env');
  const envBackupPath = path.join(__dirname, '../.env.backup');
  
  if (fs.existsSync(envPath)) {
    console.log('📦 备份原始.env文件...');
    fs.copyFileSync(envPath, envBackupPath);
    
    console.log('🔄 创建生产环境安全配置...');
    fs.writeFileSync(envPath, safeEnvContent);
    
    console.log('✅ 生产环境配置完成，API密钥已从构建中移除');
  } else {
    console.log('⚠️  未找到.env文件，创建安全配置...');
    fs.writeFileSync(envPath, safeEnvContent);
  }
} else {
  console.log('🛠️  本地开发环境，保持现有配置');
}

console.log('✅ 构建前检查完成');