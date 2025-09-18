import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ExternalLink } from 'lucide-react';
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
}

const NewsSection: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?country=us&category=business&apiKey=3c51d67b37bd40bc80a501ce5e02a8a1&pageSize=20`
      );
      setNews(response.data.articles);
    } catch (err) {
      setError('无法获取新闻数据');
    } finally {
      setLoading(false);
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
        <h2>美国商业新闻</h2>
        <p>实时更新的商业财经资讯</p>
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
                
                <h3 className="news-title">{article.title}</h3>
                <p className="news-description">{article.description}</p>
                
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