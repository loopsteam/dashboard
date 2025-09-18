import React from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Globe } from 'lucide-react';
import ExchangeRate from './ExchangeRate';
import './HomeSection.css';

const HomeSection: React.FC = () => {
  const features = [
    {
      icon: <Globe size={32} />,
      title: '实时新闻',
      description: '获取最新的美国时政新闻资讯，保持对世界动态的敏锐洞察'
    },
    {
      icon: <TrendingUp size={32} />,
      title: '股市行情',
      description: '追踪标普500和纳指100的实时数据，把握市场脉搏'
    },
    {
      icon: <Activity size={32} />,
      title: '数据可视化',
      description: '直观的图表展示和交互式数据分析，让信息一目了然'
    }
  ];

  return (
    <motion.div
      className="home-section"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* 实时汇率 - 显示在New Stocks上方 */}
      <motion.div
        className="exchange-rate-container"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <ExchangeRate />
      </motion.div>

      <div className="hero-content">
        <motion.div
          className="hero-text"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>
            <span className="gradient-text">New Stocks</span>
          </h1>
          <p className="hero-subtitle">
            现代化的信息仪表板，汇聚全球新闻与股市动态
          </p>
          <p className="hero-description">
            体验极简设计与强大功能的完美结合，实时掌握世界脉搏
          </p>
        </motion.div>

        <motion.div
          className="features-grid"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                transition: { type: "spring", stiffness: 400, damping: 17 }
              }}
            >
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="floating-elements"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <motion.div
          className="floating-element element-1"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="floating-element element-2"
          animate={{
            y: [0, -15, 0],
            rotate: [0, -3, 0]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div
          className="floating-element element-3"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 8, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </motion.div>
    </motion.div>
  );
};

export default HomeSection;