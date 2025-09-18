import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import axios from 'axios';
import { cacheManager } from '../utils/cacheManager';
import './StocksSection.css';

interface StockData {
  symbol: string;
  name: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  change: number;
  changePercent: number;
}

const StocksSection: React.FC = () => {
  const [stocksData, setStocksData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>('SPY');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('1D');
  const [exchangeRate, setExchangeRate] = useState<number>(0); // 汇率初始值为0，等待API获取
  const [showCurrency, setShowCurrency] = useState<'USD' | 'CNY'>('USD');

  useEffect(() => {
    console.log('股票组件初始化，开始获取数据...');
    fetchExchangeRate();
    fetchStocksData();
  }, []);

  const fetchExchangeRate = async () => {
    try {
      // 检查缓存
      const cached = cacheManager.get('exchange_rate_usd_cny');
      if (cached && cached.rate) {
        setExchangeRate(cached.rate);
        return;
      }

      const response = await axios.get(
        '/api/exchange/latest/CNY',
        {
          timeout: 15000, // 设置15秒超时
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data && response.data.result === 'success' && response.data.conversion_rates) {
        const rates = response.data.conversion_rates;
        // 计算1美元兑人民币：1/USD率
        const usdToCny = rates.USD ? 1 / rates.USD : 0;
        if (usdToCny > 0) {
          setExchangeRate(parseFloat(usdToCny.toFixed(4)));
        }
      } else {
        throw new Error('汇率数据格式错误');
      }
    } catch (err: any) {
      console.error('获取汇率失败:', err);
      console.log('汇率API错误详情:', {
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        message: err?.message
      });
      
      // 不设置备用汇率，保持exchangeRate为0
      console.log('无法获取汇率数据，将禁用货币转换功能');
      
      // 强制切换到USD
      setShowCurrency('USD');
    }
  };

  const fetchStocksData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('开始获取股票数据...');
      
      const apiToken = process.env.REACT_APP_TIINGO_API_TOKEN;
      
      if (!apiToken) {
        throw new Error('Tiingo API Token 不可用');
      }
      
      // 检查缓存
      const cachedStocks = cacheManager.get('stocks_data');
      if (cachedStocks) {
        console.log('使用缓存的股票数据:', cachedStocks);
        setStocksData(cachedStocks);
        setLoading(false);
        return;
      }
      
      // 使用代理服务器获取标普500指数 (SPX) 最新价格
      const spxResponse = await axios.get(
        `/api/tiingo/daily/SPX/prices?token=${apiToken}`
      );
      
      console.log('SPX API响应:', spxResponse.data);
      
      // 使用代理服务器获取纳指100指数 (NDX) 最新价格
      const ndxResponse = await axios.get(
        `/api/tiingo/daily/NDX/prices?token=${apiToken}`
      );
      
      console.log('NDX API响应:', ndxResponse.data);
      
      const processStockData = (response: any, symbol: string, name: string) => {
        console.log(`处理 ${symbol} 数据:`, response.data);
        
        const data = response.data;
        if (!data || data.length === 0) {
          console.error(`${symbol} 数据为空或格式错误:`, data);
          throw new Error(`${symbol} API数据格式错误`);
        }
        
        // Tiingo API返回的是数组，获取最新数据（数组的最后一个元素）
        const latestData = data[data.length - 1];
        console.log(`${symbol} 最新数据:`, latestData);
        
        // 检查必需字段
        if (!latestData.close || !latestData.open || !latestData.high || !latestData.low) {
          console.error(`${symbol} 数据缺少必需字段:`, latestData);
          throw new Error(`${symbol} 数据缺少必需字段`);
        }
        
        // 如果有历史数据，计算变化
        let change = 0;
        let changePercent = 0;
        if (data.length > 1) {
          const previousData = data[data.length - 2];
          change = latestData.close - previousData.close;
          changePercent = (change / previousData.close) * 100;
        }
        
        const result = {
          symbol,
          name,
          date: new Date(latestData.date).toLocaleDateString('zh-CN'),
          open: latestData.open,
          high: latestData.high,
          low: latestData.low,
          close: latestData.close,
          volume: latestData.volume,
          change,
          changePercent
        };
        
        console.log(`${symbol} 处理结果:`, result);
        return result;
      };
      
      const stocksData = [
        processStockData(spxResponse, 'SPX', '标普500指数'),
        processStockData(ndxResponse, 'NDX', '纳指100指数')
      ];
      
      console.log('成功获取所有股票数据:', stocksData);
      
      // 缓存股票数据（3分钟）
      cacheManager.set('stocks_data', stocksData, 3);
      
      setStocksData(stocksData);
      setError(null); // 清除错误状态
      console.log('股票数据已更新到组件状态');
    } catch (err: any) {
      console.error('API请求失败 - 详细错误信息:', {
        error: err,
        message: err?.message,
        response: err?.response?.data,
        status: err?.response?.status,
        statusText: err?.response?.statusText,
        config: {
          url: err?.config?.url,
          method: err?.config?.method,
          headers: err?.config?.headers
        }
      });
      
      // 检查是否是429错误（请求过多）
      if (err?.response?.status === 429) {
        // 尝试使用缓存数据
        const expiredCache = localStorage.getItem('cache_stocks_data');
        if (expiredCache) {
          try {
            const parsed = JSON.parse(expiredCache);
            setStocksData(parsed.data);
            setError('当前请求过多，显示缓存数据，1个小时后再试');
            setLoading(false);
            return;
          } catch (parseErr) {
            console.error('解析缓存数据失败:', parseErr);
          }
        }
        
        // 无缓存数据时的429错误处理
        setStocksData([]);
        setError('当前请求过多，请稍后重试（建议1个小时后）');
        setLoading(false);
        return;
      }
      
      // 其他错误的处理，尝试使用过期缓存
      const expiredCache = localStorage.getItem('cache_stocks_data');
      if (expiredCache) {
        try {
          const parsed = JSON.parse(expiredCache);
          setStocksData(parsed.data);
          setError('使用缓存数据，可能不是最新');
          setLoading(false);
          return;
        } catch (parseErr) {
          console.error('解析缓存数据失败:', parseErr);
        }
      }
      
      // 无法获取任何数据，显示错误
      setStocksData([]);
      setError('无法获取股市数据，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 格式化货币显示（支持USD/CNY切换）
  const formatCurrency = (value: number, currency: 'USD' | 'CNY' = showCurrency) => {
    // 如果汇率为0或未获取，强制显示USD
    if (exchangeRate === 0 && currency === 'CNY') {
      currency = 'USD';
    }
    
    const displayValue = currency === 'CNY' ? value * exchangeRate : value;
    const currencyCode = currency === 'CNY' ? 'CNY' : 'USD';
    const locale = currency === 'CNY' ? 'zh-CN' : 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(displayValue);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="stocks-section">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>正在加载股市数据...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const isRateLimitError = error.includes('当前请求过多');
    
    return (
      <div className="stocks-section">
        <div className={`error-container ${isRateLimitError ? 'rate-limit-error' : ''}`}>
          <p>{error}</p>
          {isRateLimitError && (
            <div className="rate-limit-info">
              <p className="rate-limit-tip">ℹ️ 提示：Tiingo API有每小时请求限制</p>
            </div>
          )}
          <button 
            onClick={fetchStocksData} 
            className={`retry-button ${isRateLimitError ? 'disabled' : ''}`}
            disabled={isRateLimitError}
            title={isRateLimitError ? '1个小时后再试' : ''}
          >
            {isRateLimitError ? '1小时后可重试' : '重试'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="stocks-section"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="section-header">
        <div className="header-content">
          <div className="title-section">
            <h2>股市行情</h2>
            <p>实时股市数据与图表分析</p>
          </div>
          <div className="currency-toggle">
            <button 
              className={`currency-btn ${showCurrency === 'USD' ? 'active' : ''}`}
              onClick={() => setShowCurrency('USD')}
            >
              USD
            </button>
            <button 
              className={`currency-btn ${showCurrency === 'CNY' ? 'active' : ''} ${exchangeRate === 0 ? 'disabled' : ''}`}
              onClick={() => exchangeRate > 0 && setShowCurrency('CNY')}
              disabled={exchangeRate === 0}
              title={exchangeRate === 0 ? '汇率数据不可用' : ''}
            >
              CNY
            </button>
          </div>
        </div>
      </div>

      <div className="stocks-container">
        <div className="stocks-overview">
          {stocksData.map((stock, index) => (
            <motion.div
              key={stock.symbol}
              className={`stock-card ${selectedStock === stock.symbol ? 'active' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => setSelectedStock(stock.symbol)}
            >
              <div className="stock-header">
                <div className="stock-info">
                  <h3>{stock.symbol}</h3>
                  <p>{stock.name}</p>
                </div>
                <div className="stock-icon">
                  <Activity size={24} />
                </div>
              </div>

              <div className="stock-price">
                <span className="price">{formatCurrency(stock.close)}</span>
                <div className={`change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {stock.change >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{formatCurrency(Math.abs(stock.change))}</span>
                  <span>({formatPercent(stock.changePercent)})</span>
                </div>
              </div>

              <div className="stock-details">
                <div className="detail-row">
                  <span className="label">开盘:</span>
                  <span className="value">{formatCurrency(stock.open)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">最高:</span>
                  <span className="value">{formatCurrency(stock.high)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">最低:</span>
                  <span className="value">{formatCurrency(stock.low)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">成交量:</span>
                  <span className="value">{formatVolume(stock.volume)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="stock-info-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="selected-stock-header">
            <h3>
              {stocksData.find(s => s.symbol === selectedStock)?.name} 
              <span className="symbol">({selectedStock})</span>
            </h3>
            <div className="stock-date">
              {stocksData.find(s => s.symbol === selectedStock)?.date}
            </div>
          </div>

          <div className="detailed-stock-info">
            {stocksData
              .filter(s => s.symbol === selectedStock)
              .map(stock => (
                <div key={stock.symbol} className="detailed-info-grid">
                  <div className="info-card">
                    <span className="info-label">开盘价</span>
                    <span className="info-value">{formatCurrency(stock.open)}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">最高价</span>
                    <span className="info-value">{formatCurrency(stock.high)}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">最低价</span>
                    <span className="info-value">{formatCurrency(stock.low)}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">收盘价</span>
                    <span className="info-value">{formatCurrency(stock.close)}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">成交量</span>
                    <span className="info-value">{formatVolume(stock.volume)}</span>
                  </div>
                  <div className="info-card">
                    <span className="info-label">涨跌幅</span>
                    <span className={`info-value ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StocksSection;