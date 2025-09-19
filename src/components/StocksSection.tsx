import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Calendar, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { cacheManager } from '../utils/cacheManager';
import { API_ENDPOINTS } from '../utils/apiConfig';
import { ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar } from 'recharts';
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

interface ChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  formattedDate: string;
}

type TimeRange = 'daily' | 'weekly' | 'monthly' | '3months';

const TIME_RANGE_CONFIG = {
  daily: { label: '日线', days: 30, freq: 'daily' },
  weekly: { label: '周线', days: 120, freq: 'weekly' },
  monthly: { label: '月线', days: 365, freq: 'monthly' },
  '3months': { label: '三个月', days: 90, freq: 'daily' }
};

const StocksSection: React.FC = () => {
  const [stocksData, setStocksData] = useState<StockData[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<string>('SPY');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('daily');
  const [exchangeRate, setExchangeRate] = useState<number>(0); // 汇率初始值为0，等待API获取
  const [showCurrency, setShowCurrency] = useState<'USD' | 'CNY'>('USD');

  useEffect(() => {
    console.log('股票组件初始化，开始获取数据...');
    fetchExchangeRate();
    fetchStocksData();
  }, []);

  useEffect(() => {
    if (selectedStock && selectedTimeRange) {
      fetchChartData(selectedStock, selectedTimeRange);
    }
  }, [selectedStock, selectedTimeRange]);

  const fetchExchangeRate = async () => {
    try {
      // 检查缓存
      const cached = cacheManager.get('exchange_rate_usd_cny');
      if (cached && cached.rate) {
        setExchangeRate(cached.rate);
        return;
      }

      const response = await axios.get(
        API_ENDPOINTS.exchange + '/latest/CNY',
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
      
      // 检查缓存
      const cachedStocks = cacheManager.get('stocks_data');
      if (cachedStocks) {
        console.log('使用缓存的股票数据:', cachedStocks);
        setStocksData(cachedStocks);
        setLoading(false);
        return;
      }
      
      // 使用API配置获取标普500 ETF (SPY) 最新价格
      const spyResponse = await axios.get(
        API_ENDPOINTS.stocks + '/daily/SPY/prices'
      );
      
      console.log('SPY API响应:', spyResponse.data);
      
      // 使用API配置获取纳指100 ETF (QQQ) 最新价格
      const qqqResponse = await axios.get(
        API_ENDPOINTS.stocks + '/daily/QQQ/prices'
      );
      
      console.log('QQQ API响应:', qqqResponse.data);
      
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
        processStockData(spyResponse, 'SPY', '标普500 ETF'),
        processStockData(qqqResponse, 'QQQ', '纳指100 ETF')
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

  const fetchChartData = async (symbol: string, timeRange: TimeRange) => {
    try {
      setChartLoading(true);
      
      const config = TIME_RANGE_CONFIG[timeRange];
      
      // 构建缓存键
      const cacheKey = `chart_${symbol}_${timeRange}`;
      
      // 检查缓存
      const cached = cacheManager.get(cacheKey);
      if (cached) {
        console.log(`使用缓存的${symbol}图表数据:`, cached);
        setChartData(cached);
        setChartLoading(false);
        return;
      }
      
      // 计算开始日期
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - config.days);
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log(`获取${symbol}的${config.label}数据，时间范围: ${startDateStr} 到 ${endDateStr}`);
      
      // 根据时间范围选择不同的API端点
      let apiUrl;
      if (timeRange === 'weekly' || timeRange === 'monthly') {
        // 使用resample端点获取周线或月线数据
        const freq = timeRange === 'weekly' ? 'weekly' : 'monthly';
        apiUrl = `${API_ENDPOINTS.stocks}/daily/${symbol}/prices?startDate=${startDateStr}&endDate=${endDateStr}&resampleFreq=${freq}`;
      } else {
        // 使用daily端点获取日线数据
        apiUrl = `${API_ENDPOINTS.stocks}/daily/${symbol}/prices?startDate=${startDateStr}&endDate=${endDateStr}`;
      }
      
      const response = await axios.get(apiUrl, { timeout: 15000 });
      
      console.log(`${symbol}图表API响应:`, response.data);
      
      if (!response.data || response.data.length === 0) {
        throw new Error(`${symbol}图表数据为空`);
      }
      
      // 处理图表数据
      const processedData: ChartDataPoint[] = response.data.map((item: any) => {
        const date = new Date(item.date);
        return {
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume,
          formattedDate: timeRange === 'monthly' 
            ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short' })
            : timeRange === 'weekly'
            ? date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
            : date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
        };
      });
      
      console.log(`${symbol}处理后的图表数据:`, processedData);
      
      // 缓存图表数据（5分钟）
      cacheManager.set(cacheKey, processedData, 5);
      
      setChartData(processedData);
    } catch (err: any) {
      console.error(`获取${symbol}图表数据失败:`, err);
      
      // 尝试使用过期缓存
      const cacheKey = `chart_${symbol}_${timeRange}`;
      const expiredCache = localStorage.getItem(`cache_${cacheKey}`);
      if (expiredCache) {
        try {
          const parsed = JSON.parse(expiredCache);
          if (parsed.data) {
            setChartData(parsed.data);
            console.log('使用过期缓存的图表数据');
          }
        } catch (parseErr) {
          console.error('解析缓存图表数据失败:', parseErr);
        }
      }
    } finally {
      setChartLoading(false);
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

  const formatVolume = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // K线图的自定义Tooltip组件
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-date">{data.formattedDate}</p>
          <div className="tooltip-data">
            <div className="tooltip-row">
              <span className="tooltip-label">开盘:</span>
              <span className="tooltip-value">{formatCurrency(data.open)}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">收盘:</span>
              <span className={`tooltip-value ${data.close >= data.open ? 'positive' : 'negative'}`}>
                {formatCurrency(data.close)}
              </span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">最高:</span>
              <span className="tooltip-value">{formatCurrency(data.high)}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">最低:</span>
              <span className="tooltip-value">{formatCurrency(data.low)}</span>
            </div>
            <div className="tooltip-row">
              <span className="tooltip-label">成交量:</span>
              <span className="tooltip-value">{formatVolume(data.volume)}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // 自定义K线柱的组件
  const CustomCandlestick = (props: any) => {
    const { payload, x, y, width, height } = props;
    if (!payload || !chartData.length) return null;

    const { open, high, low, close } = payload;
    const isRising = close >= open;
    const color = isRising ? '#ef4444' : '#10b981'; // 中国习惯：涨红跌绿
    
    // 计算缩放因子
    const dataHigh = Math.max(...chartData.map(d => d.high));
    const dataLow = Math.min(...chartData.map(d => d.low));
    const range = dataHigh - dataLow;
    
    if (range === 0) return null;
    
    // 计算坐标
    const yScale = height / range;
    const highY = y + height - (high - dataLow) * yScale;
    const lowY = y + height - (low - dataLow) * yScale;
    const openY = y + height - (open - dataLow) * yScale;
    const closeY = y + height - (close - dataLow) * yScale;
    
    const bodyTop = Math.min(openY, closeY);
    const bodyHeight = Math.abs(closeY - openY);
    
    return (
      <g>
        {/* 上下影线 */}
        <line
          x1={x + width / 2}
          y1={highY}
          x2={x + width / 2}
          y2={lowY}
          stroke={color}
          strokeWidth={1}
        />
        {/* K线主体 */}
        <rect
          x={x + width * 0.2}
          y={bodyTop}
          width={width * 0.6}
          height={Math.max(bodyHeight, 1)}
          fill={isRising ? 'none' : color}
          stroke={color}
          strokeWidth={1}
          opacity={1}
        />
      </g>
    );
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

              <div className="stock-price-container">
                <div className="price-section">
                  <span className="price">{formatCurrency(stock.close)}</span>
                </div>
              </div>

              <div className="stock-date">
                <Calendar size={16} />
                <span>{stock.date}</span>
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
          className="chart-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="chart-header">
            <div className="chart-title">
              <h3>
                {stocksData.find(s => s.symbol === selectedStock)?.name} 
                <span className="symbol">({selectedStock})</span>
              </h3>
              <p className="chart-subtitle">K线图表分析</p>
            </div>
            
            <div className="time-range-selector">
              {(Object.keys(TIME_RANGE_CONFIG) as TimeRange[]).map(range => (
                <button
                  key={range}
                  className={`time-btn ${selectedTimeRange === range ? 'active' : ''}`}
                  onClick={() => setSelectedTimeRange(range)}
                  disabled={chartLoading}
                >
                  <BarChart3 size={14} />
                  {TIME_RANGE_CONFIG[range].label}
                </button>
              ))}
            </div>
          </div>

          {chartLoading ? (
            <div className="chart-loading">
              <motion.div
                className="loading-spinner"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <p>加载图表数据中...</p>
            </div>
          ) : chartData.length > 0 ? (
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis 
                    dataKey="formattedDate" 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#4B5563' }}
                    tickLine={{ stroke: '#4B5563' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#9CA3AF' }}
                    axisLine={{ stroke: '#4B5563' }}
                    tickLine={{ stroke: '#4B5563' }}
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(value) => formatCurrency(value).replace(/[^\d.,]/g, '')}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey={(entry) => [entry.low, entry.open, entry.close, entry.high]}
                    shape={<CustomCandlestick />}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="chart-placeholder">
              <BarChart3 size={48} className="placeholder-icon" />
              <p>暂无图表数据</p>
              <button 
                onClick={() => fetchChartData(selectedStock, selectedTimeRange)}
                className="retry-chart-btn"
              >
                重新加载
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StocksSection;