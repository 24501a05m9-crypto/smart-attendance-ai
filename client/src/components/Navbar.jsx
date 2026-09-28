import React, { useState } from 'react';

import {
  Menu,
  X,
  Home,
  ClipboardList,
  BarChart3,
  SlidersHorizontal,
  History,
  CircleHelp,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  hasPredictionData
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigation = (tab) => {
    if (tab === 'dashboard' && !hasPredictionData) {
      return;
    }

    if (tab === 'leave' && !hasPredictionData) {
      return;
    }

    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <>
      {/* =================================================
          TOP NAVBAR
      ================================================= */}

      <header className="main-navbar">

        <div className="navbar-left">

          <button
            type="button"
            className="menu-button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={23} />
          </button>

          <button
            type="button"
            className="navbar-brand"
            onClick={() => handleNavigation('home')}
          >

            <div className="brand-icon">
              <Sparkles size={22} />
            </div>

            <div className="brand-text">
              <div className="brand-title">
                SMART ATTENDANCE <span>AI</span>
              </div>
              <div className="brand-tagline">
                Face the future of attendance
              </div>
            </div>

          </button>

        </div>

      </header>


      {/* =================================================
          OVERLAY
      ================================================= */}

      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}


      {/* =================================================
          NAVIGATION DRAWER
      ================================================= */}

      <aside
        className={`navigation-drawer ${
          menuOpen ? 'navigation-drawer-open' : ''
        }`}
      >

        {/* Drawer Header */}

        <div className="drawer-header">

          <div className="drawer-brand">

            <div className="drawer-brand-icon">
              <Sparkles size={18} />
            </div>

            <div className="drawer-brand-text">
              <div className="drawer-title">
                SMART ATTENDANCE <span>AI</span>
              </div>
            </div>

          </div>

          <button
            type="button"
            className="drawer-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={21} />
          </button>

        </div>


        {/* Navigation Items */}

        <nav className="drawer-navigation">

          {/* Home */}

          <button
            type="button"
            className={`drawer-item ${
              activeTab === 'home'
                ? 'drawer-item-active'
                : ''
            }`}
            onClick={() => handleNavigation('home')}
          >
            <Home size={19} />
            <span>Home</span>
          </button>


          {/* Attendance Input */}

          <button
            type="button"
            className={`drawer-item ${
              activeTab === 'input'
                ? 'drawer-item-active'
                : ''
            }`}
            onClick={() => handleNavigation('input')}
          >
            <ClipboardList size={19} />
            <span>Attendance Input</span>
          </button>


          {/* Prediction Dashboard */}

          <button
            type="button"
            disabled={!hasPredictionData}
            className={`drawer-item ${
              activeTab === 'dashboard'
                ? 'drawer-item-active'
                : ''
            } ${
              !hasPredictionData
                ? 'drawer-item-disabled'
                : ''
            }`}
            onClick={() => handleNavigation('dashboard')}
          >
            <BarChart3 size={19} />
            <span>Prediction Dashboard</span>
          </button>


          {/* Leave Simulator */}

          <button
            type="button"
            disabled={!hasPredictionData}
            className={`drawer-item ${
              activeTab === 'leave'
                ? 'drawer-item-active'
                : ''
            } ${
              !hasPredictionData
                ? 'drawer-item-disabled'
                : ''
            }`}
            onClick={() => handleNavigation('leave')}
          >
            <SlidersHorizontal size={19} />
            <span>Leave Simulator</span>
          </button>


          {/* History */}

          <button
            type="button"
            className={`drawer-item ${
              activeTab === 'history'
                ? 'drawer-item-active'
                : ''
            }`}
            onClick={() => handleNavigation('history')}
          >
            <History size={19} />
            <span>History</span>
          </button>


          {/* About ML */}

          <button
            type="button"
            className={`drawer-item ${
              activeTab === 'about'
                ? 'drawer-item-active'
                : ''
            }`}
            onClick={() => handleNavigation('about')}
          >
            <CircleHelp size={19} />
            <span>About ML</span>
          </button>

        </nav>


        {/* Drawer Footer */}

        <div className="drawer-footer">
          Smart Attendance Prediction System
        </div>

      </aside>


      {/* =================================================
          NAVBAR STYLES
      ================================================= */}

      <style>{`

        /* ================================================
           TOP NAVBAR
        ================================================ */

        .main-navbar {
          position: sticky;

          top: 0;

          z-index: 1000;

          width: 100%;

          height: 76px;

          display: flex;

          align-items: center;

          padding: 0 1.5rem;

          box-sizing: border-box;

          background: rgba(255, 255, 255, 0.94);

          border-bottom:
            1px solid var(--border-subtle);

          box-shadow:
            0 3px 14px rgba(15, 23, 42, 0.055);

          backdrop-filter: blur(14px);
        }


        /* ================================================
           LEFT SIDE
        ================================================ */

        .navbar-left {
          display: flex;

          align-items: center;

          gap: 0.9rem;
        }


        /* ================================================
           MENU BUTTON
        ================================================ */

        .menu-button {
          width: 43px;

          height: 43px;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 0;

          border:
            1px solid #D7DEE7;

          border-radius: 10px;

          background: #FFFFFF;

          color: #0F172A;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .menu-button:hover {
          background: #DFF3FA;

          border-color: #A9DDEA;

          color: #0F172A;

          transform: translateY(-1px);

          box-shadow:
            0 4px 12px rgba(56, 189, 248, 0.12);
        }


        .menu-button:active {
          transform: translateY(0);
        }


        /* ================================================
           BRAND
        ================================================ */

        .navbar-brand {
          display: flex;

          align-items: center;

          gap: 0.7rem;

          padding: 0;

          border: none;

          background: transparent;

          color: inherit;

          cursor: pointer;

          text-align: left;
        }


        /* ================================================
           BRAND ICON
        ================================================ */

        .brand-icon {
          width: 42px;

          height: 42px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 11px;

          background:
            linear-gradient(
              135deg,
              #DFF3FA 0%,
              #FFFFFF 55%,
              #FBEDE6 100%
            );

          border:
            1px solid #C9E6EE;

          color: #0F172A;

          box-shadow:
            0 3px 10px rgba(15, 23, 42, 0.06);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }


        .navbar-brand:hover .brand-icon {
          transform: translateY(-1px);

          box-shadow:
            0 5px 14px rgba(15, 23, 42, 0.09);
        }


        /* ================================================
           BRAND TEXT
        ================================================ */

        .brand-text {
          display: flex;

          flex-direction: column;

          align-items: flex-start;
        }


        .brand-title {
          color: #0F172A;

          font-family:
            var(--font-heading);

          font-size: 1rem;

          font-weight: 800;

          line-height: 1.1;

          letter-spacing: 0.015em;

          white-space: nowrap;
        }


        .brand-title span {
          color: #0F172A;

          font-weight: 900;
        }


        .brand-tagline {
          color: #64748B;

          font-size: 0.72rem;

          font-weight: 500;

          line-height: 1.25;
        }


        /* ================================================
           OVERLAY
        ================================================ */

        .menu-overlay {
          position: fixed;

          inset: 0;

          z-index: 1998;

          background:
            rgba(15, 23, 42, 0.28);

          backdrop-filter: blur(2px);

          animation:
            menu-fade-in 0.2s ease;
        }


        /* ================================================
           DRAWER
        ================================================ */

        .navigation-drawer {
          position: fixed;

          top: 0;

          left: 0;

          z-index: 1999;

          width: 300px;

          height: 100vh;

          display: flex;

          flex-direction: column;

          box-sizing: border-box;

          background: #FFFFFF;

          border-right:
            1px solid var(--border-subtle);

          box-shadow:
            15px 0 45px rgba(15, 23, 42, 0.12);

          transform:
            translateX(-100%);

          transition:
            transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }


        .navigation-drawer-open {
          transform:
            translateX(0);
        }


        /* ================================================
           DRAWER HEADER
        ================================================ */

        .drawer-header {
          height: 76px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding: 0 1.15rem;

          box-sizing: border-box;

          border-bottom:
            1px solid var(--border-subtle);

          background:
            linear-gradient(
              90deg,
              #FFFFFF 0%,
              #F9FCFD 100%
            );
        }


        /* ================================================
           DRAWER BRAND
        ================================================ */

        .drawer-brand {
          display: flex;

          align-items: center;

          gap: 0.65rem;
        }


        .drawer-brand-icon {
          width: 35px;

          height: 35px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #DFF3FA,
              #FBEDE6
            );

          border:
            1px solid #C9E6EE;

          color: #0F172A;
        }


        .drawer-brand-text {
          display: flex;

          flex-direction: column;
        }


        .drawer-title {
          color: #0F172A;

          font-family:
            var(--font-heading);

          font-size: 0.78rem;

          font-weight: 800;

          letter-spacing: 0.01em;
        }


        .drawer-title span {
          color: #0F172A;
        }


        /* ================================================
           CLOSE BUTTON
        ================================================ */

        .drawer-close {
          width: 38px;

          height: 38px;

          display: flex;

          align-items: center;

          justify-content: center;

          padding: 0;

          border:
            1px solid transparent;

          border-radius: 9px;

          background: transparent;

          color: #64748B;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }


        .drawer-close:hover {
          background: #FBEDE6;

          border-color: #F2D5C7;

          color: #0F172A;
        }


        /* ================================================
           NAVIGATION
        ================================================ */

        .drawer-navigation {
          display: flex;

          flex-direction: column;

          gap: 0.35rem;

          padding: 1.2rem 0.8rem;
        }


        /* ================================================
           NAV ITEM
        ================================================ */

        .drawer-item {
          width: 100%;

          display: flex;

          align-items: center;

          gap: 0.85rem;

          padding:
            0.78rem 0.9rem;

          box-sizing: border-box;

          border:
            1px solid transparent;

          border-radius: 10px;

          background: transparent;

          color: #64748B;

          font-family:
            var(--font-heading);

          font-size: 0.88rem;

          font-weight: 600;

          text-align: left;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }


        .drawer-item svg {
          flex-shrink: 0;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }


        /* ================================================
           NAV HOVER
        ================================================ */

        .drawer-item:hover:not(:disabled) {
          background: #F0F9FC;

          color: #0F172A;

          border-color: #D5EDF3;

          transform: translateX(2px);
        }


        .drawer-item:hover:not(:disabled) svg {
          color: #0F172A;

          transform: scale(1.04);
        }


        /* ================================================
           ACTIVE ITEM
        ================================================ */

        .drawer-item-active {
          background:
            linear-gradient(
              90deg,
              #DFF3FA 0%,
              #EEF9FC 100%
            );

          border-color: #BDE3EC;

          color: #0F172A;

          box-shadow:
            0 3px 10px rgba(56, 189, 248, 0.08);
        }


        .drawer-item-active svg {
          color: #0F172A;
        }


        .drawer-item-active:hover {
          background:
            linear-gradient(
              90deg,
              #D6F0F7 0%,
              #EAF8FC 100%
            );

          color: #0F172A;

          border-color: #A9DDEA;

          transform: translateX(2px);
        }


        /* ================================================
           DISABLED ITEMS
        ================================================ */

        .drawer-item:disabled,
        .drawer-item-disabled {
          opacity: 0.42;

          color: #94A3B8;

          cursor: not-allowed;

          transform: none !important;
        }


        .drawer-item:disabled svg,
        .drawer-item-disabled svg {
          color: #94A3B8;
        }


        /* ================================================
           DRAWER FOOTER
        ================================================ */

        .drawer-footer {
          margin-top: auto;

          padding: 1.2rem;

          border-top:
            1px solid var(--border-subtle);

          background:
            linear-gradient(
              90deg,
              #FFFFFF,
              #FCF8F6
            );

          color: #94A3B8;

          font-size: 0.65rem;

          line-height: 1.5;
        }


        /* ================================================
           ANIMATION
        ================================================ */

        @keyframes menu-fade-in {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }


        /* ================================================
           MOBILE
        ================================================ */

        @media (max-width: 600px) {

          .main-navbar {
            height: 70px;

            padding: 0 1rem;
          }


          .menu-button {
            width: 40px;

            height: 40px;
          }


          .brand-icon {
            width: 38px;

            height: 38px;
          }


          .brand-title {
            font-size: 0.88rem;
          }


          .navigation-drawer {
            width: 285px;
          }


          .drawer-header {
            height: 70px;
          }

        }


        @media (max-width: 380px) {

          .brand-title {
            font-size: 0.80rem;
          }

        }

      `}</style>
    </>
  );
}