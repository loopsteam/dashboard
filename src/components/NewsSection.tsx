import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink, Languages, RotateCcw } from 'lucide-react';
import axios from 'axios';
import './NewsSection.css';

interface NewsItem {
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  translatedTitle?: string;
  translatedDescription?: string;
  isTranslating?: boolean;
  translationError?: string;
}

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showChinese, setShowChinese] = useState(false);
  const [translatingCount, setTranslatingCount] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const apiKey = process.env.REACT_APP_NEWS_API_KEY;
      
      if (!apiKey) {
        throw new Error('News API Key 不可用');
      }
      
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=${apiKey}&pageSize=20`
      );
      setNews(response.data.articles);
    } catch (err) {
      setError('无法获取新闻数据');
    } finally {
      setLoading(false);
    }
  };

  // 翻译单个新闻条目
  const translateNewsItem = async (index: number) => {
    const apiKey = process.env.REACT_APP_DOUBAO_API_KEY;
    
    if (!apiKey) {
      console.error('Doubao API Key 未配置');
      return;
    }

    const newsItem = news[index];
    if (!newsItem || newsItem.isTranslating || (newsItem.translatedTitle && newsItem.translatedDescription)) {
      return;
    }

    // 更新状态：开始翻译
    setNews(prev => prev.map((item, i) => 
      i === index ? { ...item, isTranslating: true, translationError: undefined } : item
    ));
    setTranslatingCount(prev => prev + 1);

    try {
      const prompt = `请将以下英文新闻内容翻译成中文，保持新闻的专业性和准确性：

标题：${newsItem.title}

描述：${newsItem.description || '无描述'}

请以JSON格式返回，包含"title"和"description"字段：`;

      const response = await axios.post(
        'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
        {
          model: 'doubao-seed-1-6-flash-250828',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          timeout: 15000
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content.trim();
        
        try {
          // 尝试解析JSON格式的响应
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            setNews(prev => prev.map((item, i) => 
              i === index ? {
                ...item,
                translatedTitle: parsed.title || content.split('\n')[0],
                translatedDescription: parsed.description || content.split('\n')[1] || '翻译失败',
                isTranslating: false
              } : item
            ));
          } else {
            // 如果不是JSON格式，尝试按行分割
            const lines = content.split('\n').filter((line: string) => line.trim());
            setNews(prev => prev.map((item, i) => 
              i === index ? {
                ...item,
                translatedTitle: lines[0] || '翻译失败',
                translatedDescription: lines[1] || lines[0] || '翻译失败',
                isTranslating: false
              } : item
            ));
          }
        } catch (parseError) {
          // JSON解析失败，使用原始内容
          setNews(prev => prev.map((item, i) => 
            i === index ? {
              ...item,
              translatedTitle: content.substring(0, 100) + '...',
              translatedDescription: content.substring(100, 300) + '...',
              isTranslating: false
            } : item
          ));
        }
      } else {
        throw new Error('翻译响应格式错误');
      }

    } catch (err: any) {
      console.error('翻译失败:', err);
      setNews(prev => prev.map((item, i) => 
        i === index ? {
          ...item,
          isTranslating: false,
          translationError: '翻译失败，请稍后重试'
        } : item
      ));
    } finally {
      setTranslatingCount(prev => prev - 1);
    }
  };

  // 翻译当前页所有新闻
  const translateCurrentPage = async () => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, news.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      // 逐个翻译，避免并发请求过多
      await new Promise(resolve => setTimeout(resolve, 500)); // 间隔500ms
      await translateNewsItem(i);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const paginatedNews = news.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const totalPages = Math.ceil(news.length / itemsPerPage);

  if (loading) {
    return (
      <div className="news-section">
        <div className="loading-container">
          <motion.div
            className="loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p>正在加载新闻...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-section">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchNews} className="retry-button">
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="news-section"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="section-header">
        <div className="header-content">
          <div className="title-section">
            <h2>美国商业新闻</h2>
          </div>
          <div className="translation-controls">
            <button 
              className={`lang-toggle ${showChinese ? 'active' : ''}`}
              onClick={() => setShowChinese(!showChinese)}
              title="切换中英文显示"
            >
              <Languages size={16} />
              {showChinese ? '中文' : 'English'}
            </button>
            
            {showChinese && (
              <button 
                className="translate-btn"
                onClick={translateCurrentPage}
                disabled={translatingCount > 0}
                title="翻译当前页新闻"
              >
                {translatingCount > 0 ? (
                  <>
                    <RotateCcw size={16} className="spinning" />
                    翻译中({translatingCount})
                  </>
                ) : (
                  <>
                    <Languages size={16} />
                    翻译本页
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={currentPage}
          className="news-grid"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
        >
          {paginatedNews.map((article, index) => (
            <motion.div
              key={`${currentPage}-${index}`}
              className="news-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              {article.urlToImage && (
                <div className="news-image">
                  <img src={article.urlToImage} alt={article.title} />
                </div>
              )}
              
              <div className="news-content">
                <div className="news-meta">
                  <span className="news-source">{article.source.name}</span>
                  <div className="news-time">
                    <Clock size={14} />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                </div>
                
                <h3 className="news-title">
                  {showChinese && article.translatedTitle 
                    ? article.translatedTitle 
                    : article.title
                  }
                  {showChinese && article.isTranslating && (
                    <span className="translating-indicator">
                      <RotateCcw size={12} className="spinning" />
                    </span>
                  )}
                </h3>
                <p className="news-description">
                  {showChinese && article.translatedDescription 
                    ? article.translatedDescription 
                    : article.description
                  }
                  {showChinese && article.translationError && (
                    <span className="translation-error">{article.translationError}</span>
                  )}
                </p>
                
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="news-link"
                >
                  阅读全文
                  <ExternalLink size={16} />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>

      {totalPages > 1 && (
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <motion.button
              key={i}
              className={`page-button ${currentPage === i ? 'active' : ''}`}
              onClick={() => setCurrentPage(i)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {i + 1}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default NewsSection;