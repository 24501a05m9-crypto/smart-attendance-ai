import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BarChart3, 
  CalendarClock, 
  History, 
  HelpCircle, 
  Home, 
  ShieldCheck, 
  Menu, 
  X, 
  Activity 
} from 'lucide-react';
import { checkHealth } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, hasPredictionData }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState('checking'); // 'online' | 'degraded' | 'offline'

  useEffect(() => {
    const verifyHealth = async () => {
      try {
        const res = await checkHealth();
        if (res.status === 'ok' && res.ml_service?.model_loaded) {
          setSystemStatus('online');
        } else {
          setSystemStatus('degraded');
        }
      } catch (e) {
        setSystemStatus('offline');
      }
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'input', label: 'Attendance Input', icon: CalendarClock },
    { id: 'dashboard', label: 'Prediction Dashboard', icon: BarChart3, disabled: !hasPredictionData },
    { id: 'leave', label: 'Leave Simulator', icon: Sparkles },
    { id: 'history', label: 'History', icon: History },
    { id: 'about', label: 'About ML', icon: HelpCircle },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand */}
        <div className="navbar-brand" onClick={() => handleNavClick('home')}>
          <div className="brand-icon-wrapper">
            <Sparkles className="brand-icon" size={22} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">SMART ATTENDANCE <span className="highlight-ai">AI</span></span>
            <span className="brand-subtitle">Random Forest ML Regressor</span>
          </div>
        </div>

        {/* System Status & No-Login Badge (Desktop) */}
        <div className="navbar-badges desktop-only">
          <div className="no-login-badge">
            <ShieldCheck size={14} className="badge-icon-shield" />
            <span>No Login Required</span>
          </div>

          <div className={`status-pill status-${systemStatus}`} title={`System Status: ${systemStatus}`}>
            <span className="status-dot"></span>
            <span className="status-text">
              {systemStatus === 'online' ? 'ML Engine Online' : systemStatus === 'degraded' ? 'Degraded' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav desktop-only">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                disabled={item.disabled}
                className={`nav-link ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                title={item.disabled ? 'Enter attendance first to view predictions' : ''}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-menu-btn mobile-only" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer mobile-only animate-fade-in">
          <div className="mobile-drawer-badges">
            <div className="no-login-badge">
              <ShieldCheck size={14} />
              <span>No Login Required • Direct Access</span>
            </div>
            <div className={`status-pill status-${systemStatus}`}>
              <span className="status-dot"></span>
              <span>{systemStatus === 'online' ? 'ML Engine Online' : 'Connecting...'}</span>
            </div>
          </div>

          <nav className="mobile-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  disabled={item.disabled}
                  className={`mobile-nav-link ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      )}

      <style>{`
        .navbar-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(9, 13, 22, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid var(--border-subtle);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        }
        .navbar-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0.85rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          user-select: none;
        }
        .brand-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.3));
          border: 1px solid rgba(56, 189, 248, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.3);
        }
        .brand-icon {
          color: var(--primary);
        }
        .brand-text-group {
          display: flex;
          flex-direction: column;
        }
        .brand-title {
          font-family: var(--font-heading);
          font-size: 1.15rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .highlight-ai {
          background: linear-gradient(90deg, #38BDF8, #818CF8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .brand-subtitle {
          font-size: 0.7rem;
          color: var(--text-muted);
          font-weight: 500;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .navbar-badges {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .no-login-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--primary);
        }
        .badge-icon-shield {
          color: #38BDF8;
        }
        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.3rem 0.65rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .status-online {
          background: rgba(16, 185, 129, 0.1);
          color: #10B981;
          border: 1px solid rgba(16, 185, 129, 0.3);
        }
        .status-online .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10B981;
          box-shadow: 0 0 8px #10B981;
        }
        .status-degraded, .status-checking {
          background: rgba(245, 158, 11, 0.1);
          color: #F59E0B;
          border: 1px solid rgba(245, 158, 11, 0.3);
        }
        .status-degraded .status-dot, .status-checking .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #F59E0B;
        }
        .status-offline {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }
        .status-offline .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #EF4444;
        }
        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .nav-link {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.55rem 0.9rem;
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          font-weight: 500;
          border: 1px solid transparent;
        }
        .nav-link:hover:not(:disabled) {
          color: var(--text-main);
          background: rgba(255, 255, 255, 0.05);
        }
        .nav-link.active {
          color: #FFFFFF;
          background: rgba(56, 189, 248, 0.12);
          border-color: rgba(56, 189, 248, 0.3);
        }
        .nav-link.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .mobile-menu-btn {
          background: transparent;
          color: var(--text-main);
          padding: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mobile-drawer {
          background: #0D1424;
          border-bottom: 1px solid var(--border-subtle);
          padding: 1.25rem 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .mobile-drawer-badges {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-card);
        }
        .mobile-nav-list {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .mobile-nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          font-size: 0.95rem;
          text-align: left;
          width: 100%;
        }
        .mobile-nav-link.active {
          background: rgba(56, 189, 248, 0.15);
          border-color: rgba(56, 189, 248, 0.3);
          color: #FFFFFF;
        }
        .mobile-nav-link.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        @media (min-width: 992px) {
          .mobile-only { display: none !important; }
        }
        @media (max-width: 991px) {
          .desktop-only { display: none !important; }
        }
      `}</style>
    </header>
  );
}
