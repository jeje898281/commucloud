// src/pages/home/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/HomePage.css';
import { useAuth } from '../../contexts/AuthContext';

function HomePage() {
  const { isLoggedIn } = useAuth();
  const target = isLoggedIn ? '/meetings' : '/please-login';
  const state = { from: '/meetings' };

  return (
    <div className="homepage">

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <div className="hero-eyebrow">社區大會管理系統</div>
          <h1 className="hero-title">高效管理社區大會</h1>
          <p className="hero-desc">
            整合 QR Code 掃描與手動簽到，即時統計出席人數與出席率，讓每次大會管理更輕鬆有效率。
          </p>
          <Link to={target} className="btn btn-primary hero-cta" state={state}>
            {isLoggedIn ? '前往會議管理' : '立即開始'}
          </Link>
        </div>

        <div className="hero-visual">
          <div className="hero-dashboard">
            <div className="dashboard-header">
              <span className="dashboard-title">出席統計</span>
              <span className="dashboard-badge">即時</span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">81%</span>
              <span className="dashboard-stat-label">出席率</span>
            </div>
            <div className="dashboard-bar-wrap">
              <div className="dashboard-bar-label">
                <span>已出席</span><span>26 / 32</span>
              </div>
              <div className="dashboard-bar-track">
                <div className="dashboard-bar-fill" style={{ width: '81%' }}></div>
              </div>
            </div>
            <div className="dashboard-bar-wrap">
              <div className="dashboard-bar-label">
                <span>出席門檻</span><span>67%</span>
              </div>
              <div className="dashboard-bar-track">
                <div className="dashboard-bar-fill threshold" style={{ width: '67%' }}></div>
              </div>
            </div>
            <div className="dashboard-items">
              <div className="dashboard-item">
                <span className="dashboard-dot success"></span>
                <span>已達出席門檻</span>
              </div>
              <div className="dashboard-item">
                <span className="dashboard-dot warning"></span>
                <span>3 筆待確認</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-header">
          <h2>核心功能</h2>
          <p>三種方式，完整管理社區大會出席流程</p>
        </div>
        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                <path d="M14 14h3v3M14 20h3M20 14v3M20 20" />
              </svg>
            </div>
            <h3>QR 掃描報到</h3>
            <p>使用 QR Code 即可快速完成報到，無需手動輸入戶號，大幅提升報到效率。</p>
            <Link to={target} className="feature-link" state={state}>選擇會議進行掃描</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </div>
            <h3>手動簽到</h3>
            <p>無需擔心設備問題，支援輸入戶號手動記錄，彈性應對各種現場狀況。</p>
            <Link to={target} className="feature-link" state={state}>選擇會議手動簽到</Link>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </div>
            <h3>統計摘要</h3>
            <p>全面記錄並分析出席數據，即時掌握門檻達成狀況，輸出完整出席報告。</p>
            <Link to={target} className="feature-link" state={state}>選擇會議查看統計</Link>
          </div>

        </div>
      </section>

    </div>
  );
}

export default HomePage;
