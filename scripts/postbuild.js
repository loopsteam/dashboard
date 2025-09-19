#!/usr/bin/env node

/**
 * 构建后脚本 - 恢复本地开发配置
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 执行构建后清理...');

const envPath = path.join(__dirname, '../.env');
const envBackupPath = path.join(__dirname, '../.env.backup');

// 检查是否有备份文件需要恢复
if (fs.existsSync(envBackupPath)) {
  console.log('📦 恢复原始.env文件...');
  fs.copyFileSync(envBackupPath, envPath);
  fs.unlinkSync(envBackupPath);
  console.log('✅ 原始配置已恢复');
} else {
  console.log('ℹ️  无需恢复配置文件');
}

console.log('✅ 构建后清理完成');