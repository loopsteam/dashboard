import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, RefreshCw, TrendingUp, CircleDollarSign, Banknote } from 'lucide-react';
import axios from 'axios';
import { cacheManager } from '../utils/cacheManager';
import './ExchangeRate.css';

interface ExchangeRateData {
  usdToCny: number;
  cnyToJpy: number;
  cnyToKrw: number;
  lastUpdate: string;
}

interface ExchangeApiResponse {
  result: string;
  base_code: string;
  conversion_rates: {
    [key: string]: number;
  };
  time_last_update_utc: string;
}

const ExchangeRate: React.FC = () => {
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);

      // 检查缓存
      const cached = cacheManager.get('exchange_rates_multiple');
      if (cached) {
        console.log('使用缓存的汇率数据:', cached);
        setExchangeRates(cached);
        setLoading(false);
        return;
      }

      console.log('获取最新汇率数据... 预计等待10-15秒');
      const startTime = Date.now();
      
      try {
        // 使用新的ExchangeRate API获取以CNY为基础的所有汇率
        const response = await axios.get('/api/exchange/latest/CNY', {
          timeout: 15000
        });
        
        const endTime = Date.now();
        console.log(`汇率API响应时间: ${(endTime - startTime) / 1000}秒`);
        console.log('汇率API响应:', response.data);

        const apiData: ExchangeApiResponse = response.data;
        
        if (apiData.result === 'success' && apiData.conversion_rates) {
          const rates = apiData.conversion_rates;
          
          // 计算1美元兑人民币：1/USD率
          const usdToCny = rates.USD ? 1 / rates.USD : 7.2450;
          // 1人民币兑日元：直接使用JPY率
          const cnyToJpy = rates.JPY || 20.85;
          // 1人民币兑韩元：直接使用KRW率
          const cnyToKrw = rates.KRW || 185.60;
          
          const rateData: ExchangeRateData = {
            usdToCny: parseFloat(usdToCny.toFixed(4)),
            cnyToJpy: parseFloat(cnyToJpy.toFixed(2)),
            cnyToKrw: parseFloat(cnyToKrw.toFixed(0)),
            lastUpdate: new Date(apiData.time_last_update_utc).toLocaleString('zh-CN')
          };

          setExchangeRates(rateData);
          
          // 缓存汇率数据（5分钟）
          cacheManager.set('exchange_rates_multiple', rateData, 5);
          console.log('汇率数据已缓存');
          return; // 成功获取数据，直接返回
        } else {
          throw new Error('汇率数据格式错误');
        }
      } catch (primaryApiError) {
        console.error('主要API失败，将使用备用数据:', primaryApiError);
        // 主要API失败，继续执行备用逻辑
      }
    } catch (err: any) {
      console.error('获取汇率失败:', err);
      console.log('错误详情:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        message: err?.message
      });
      
      // 检查是否是503服务不可用错误
      if (err?.response?.status === 503) {
        setError('汇率服务暂时不可用，请稍后重试');
      } else {
        setError('无法获取汇率数据，请稍后重试');
      }
      
      // 尝试使用过期的缓存
      const expiredCache = localStorage.getItem('cache_exchange_rates_multiple');
      if (expiredCache) {
        try {
          const parsed = JSON.parse(expiredCache);
          if (parsed.data) {
            setExchangeRates(parsed.data);
            setError('使用缓存汇率数据');
          }
        } catch (parseErr) {
          console.error('解析缓存汇率数据失败:', parseErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    cacheManager.delete('exchange_rates_multiple');
    fetchExchangeRates();
  };

  return (
    <motion.div
      className="exchange-rate-section"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="section-header">
        <h2>实时汇率</h2>
        <p>多货币汇率实时更新</p>
      </div>

      {loading && (
        <div className="exchange-loading">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <div className="loading-text">
            <div>获取汇率中...</div>
            <div className="loading-sub">预计等待10-15秒</div>
          </div>
        </div>
      )}

      {error && (
        <div className="exchange-error">
          <p>{error}</p>
          <button onClick={handleRefresh} className="retry-button" disabled={loading}>
            {loading ? '重试中...' : '重试'}
          </button>
          {error.includes('服务暂时不可用') && (
            <p className="error-tip">提示：汇率服务可能维护中，请稍后再试</p>
          )}
        </div>
      )}

      {exchangeRates && (
        <div className="exchange-cards">
          <motion.div
            className="exchange-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="card-icon">
              <DollarSign size={24} />
            </div>
            <div className="card-content">
              <div className="rate-label">USD → CNY</div>
              <div className="rate-value">1 USD = {exchangeRates.usdToCny.toFixed(4)} CNY</div>
            </div>
          </motion.div>

          <motion.div
            className="exchange-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="card-icon">
              <CircleDollarSign size={24} />
            </div>
            <div className="card-content">
              <div className="rate-label">CNY → JPY</div>
              <div className="rate-value">1 CNY = {exchangeRates.cnyToJpy.toFixed(2)} JPY</div>
            </div>
          </motion.div>

          <motion.div
            className="exchange-card"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
          >
            <div className="card-icon">
              <Banknote size={24} />
            </div>
            <div className="card-content">
              <div className="rate-label">CNY → KRW</div>
              <div className="rate-value">1 CNY = {exchangeRates.cnyToKrw.toFixed(0)} KRW</div>
            </div>
          </motion.div>
        </div>
      )}

      {exchangeRates && (
        <div className="update-info">
          <span>更新时间: {exchangeRates.lastUpdate}</span>
          <motion.button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={loading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

export default ExchangeRate;