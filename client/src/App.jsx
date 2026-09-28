import React, { useState } from 'react';

import './index.css';

import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import InputView from './components/InputView';
import DashboardView from './components/DashboardView';
import LeaveSimulatorView from './components/LeaveSimulatorView';
import HistoryView from './components/HistoryView';
import AboutMlView from './components/AboutMlView';
import SynapseAI from './components/SynapseAi';

function App() {

  // ================================
  // APP STATE
  // ================================

  const [activeTab, setActiveTab] = useState('home');

  const [synapseOpen, setSynapseOpen] = useState(false);

  const [predictionData, setPredictionData] = useState(null);

  const [currentStudent, setCurrentStudent] = useState(null);

  const [currentSubjects, setCurrentSubjects] = useState([]);


  // ================================
  // PREDICTION COMPLETED
  // ================================

  const handlePredictionComplete = (data) => {

    console.log('Prediction completed:', data);

    setPredictionData(data);

    if (data?.student_info) {
      setCurrentStudent(data.student_info);
    }

    if (data?.subject_breakdown) {
      setCurrentSubjects(data.subject_breakdown);
    }

    setActiveTab('dashboard');
  };


  // ================================
  // LOAD HISTORY SESSION
  // ================================

  const handleLoadHistorySession = (session) => {

    console.log('Loading history session:', session);

    if (!session) {
      return;
    }

    const loadedPrediction =
      session.predictionData ||
      session.prediction_data ||
      session;

    setPredictionData(loadedPrediction);

    setCurrentStudent(
      session.student ||
      session.student_info ||
      loadedPrediction?.student_info ||
      null
    );

    setCurrentSubjects(
      session.subjects ||
      session.subject_breakdown ||
      loadedPrediction?.subject_breakdown ||
      []
    );

    setActiveTab('dashboard');
  };


  // ================================
  // NAVIGATION
  // ================================

  const goHome = () => {
    setActiveTab('home');
    setSynapseOpen(false);
  };


  const goToInput = () => {

    console.log('Navigating to InputView');

    setSynapseOpen(false);
    setActiveTab('input');
  };


  const goToDashboard = () => {

    if (!predictionData) {
      setActiveTab('input');
      return;
    }

    setActiveTab('dashboard');
  };


  const goToLeaveSimulator = () => {

    if (!predictionData) {
      setActiveTab('input');
      return;
    }

    setSynapseOpen(false);
    setActiveTab('leave');
  };


  // ================================
  // RENDER CURRENT PAGE
  // ================================

  const renderView = () => {

    console.log('Rendering:', activeTab);

    switch (activeTab) {

      // --------------------------------
      // HOME
      // --------------------------------

      case 'home':
        return (
          <HomeView
            onStart={goToInput}
          />
        );


      // --------------------------------
      // ATTENDANCE INPUT
      // --------------------------------

      case 'input':
        return (
          <InputView
            onPredictionComplete={handlePredictionComplete}
            initialData={predictionData}
          />
        );


      // --------------------------------
      // DASHBOARD
      // --------------------------------

      case 'dashboard':
        return (
          <DashboardView
            predictionData={predictionData}
            onEditAttendance={goToInput}
            onOpenLeaveSimulator={goToLeaveSimulator}
          />
        );


      // --------------------------------
      // LEAVE SIMULATOR
      // --------------------------------

      case 'leave':
        return (
          <LeaveSimulatorView
            student={currentStudent}
            subjects={currentSubjects}
            currentPrediction={predictionData}
            onGoToInput={goToInput}
          />
        );


      // --------------------------------
      // HISTORY
      // --------------------------------

      case 'history':
        return (
          <HistoryView
            onLoadPrediction={handleLoadHistorySession}
            onGoToInput={goToInput}
          />
        );


      // --------------------------------
      // ABOUT ML
      // --------------------------------

      case 'about':
        return (
          <AboutMlView />
        );


      // --------------------------------
      // FALLBACK
      // --------------------------------

      default:
        return (
          <HomeView
            onStart={goToInput}
          />
        );
    }
  };


  // ================================
  // APP
  // ================================

  return (
    <div className="app">

      {/* ==============================
          NAVBAR
      =============================== */}

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasPredictionData={!!predictionData}
      />


      {/* ==============================
          MAIN CONTENT
      =============================== */}

      <main className="app-main">
        {renderView()}
      </main>


      {/* ==============================
          SYNAPSE AI
      =============================== */}

      {predictionData && (
        <>

          {/* Overlay */}

          {synapseOpen && (
            <div
              className="synapse-overlay"
              onClick={() => setSynapseOpen(false)}
            />
          )}


          {/* Floating Button */}

          {!synapseOpen && (
            <button
              type="button"
              className="synapse-floating-button"
              onClick={() => setSynapseOpen(true)}
              aria-label="Open Synapse AI"
            >
              <span className="synapse-star">✦</span>
              Synapse AI
            </button>
          )}


          {/* Drawer */}

          <aside
            className={`synapse-drawer ${
              synapseOpen
                ? 'synapse-drawer-open'
                : ''
            }`}
          >

            <SynapseAI
              student={currentStudent}
              subjects={currentSubjects}
              predictionData={predictionData}
              onClose={() => setSynapseOpen(false)}
            />

          </aside>

        </>
      )}


      {/* ==============================
          FOOTER
      =============================== */}

      <footer className="app-footer">
        <p>
          Smart Attendance Prediction System
        </p>
      </footer>


      {/* ==============================
          APP STYLES
      =============================== */}

      <style>{`

        /* ==========================================
           MAIN APP
        ========================================== */

        .app {
          min-height: 100vh;

          display: flex;
          flex-direction: column;

          background:
            radial-gradient(
              circle at 10% 0%,
              rgba(223, 243, 250, 0.75),
              transparent 32%
            ),
            radial-gradient(
              circle at 90% 100%,
              rgba(251, 237, 230, 0.75),
              transparent 32%
            ),
            var(--bg-canvas);

          color: var(--text-main);
        }


        .app-main {
          flex: 1;

          width: 100%;

          background: transparent;

          color: var(--text-main);
        }


        /* ==========================================
           FOOTER
        ========================================== */

        .app-footer {
          width: 100%;

          padding: 1.2rem 1rem;

          text-align: center;

          background: rgba(255, 255, 255, 0.82);

          border-top:
            1px solid var(--border-subtle);

          backdrop-filter: blur(10px);
        }


        .app-footer p {
          margin: 0;

          color: var(--text-muted);

          font-size: 0.75rem;

          font-weight: 500;
        }


        /* ==========================================
           SYNAPSE OVERLAY
        ========================================== */

        .synapse-overlay {
          position: fixed;

          inset: 0;

          z-index: 1998;

          background:
            rgba(15, 23, 42, 0.28);

          backdrop-filter:
            blur(3px);

          animation:
            synapseFadeIn 0.2s ease;
        }


        /* ==========================================
           SYNAPSE FLOATING BUTTON
        ========================================== */

        .synapse-floating-button {
          position: fixed;

          right: 1.5rem;

          bottom: 1.5rem;

          z-index: 1997;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 0.45rem;

          border:
            1px solid rgba(15, 23, 42, 0.08);

          border-radius: 999px;

          padding:
            0.8rem 1.2rem;

          background:
            var(--primary);

          color: #FFFFFF;

          font-family:
            var(--font-heading);

          font-size: 0.85rem;

          font-weight: 700;

          cursor: pointer;

          box-shadow:
            0 8px 25px
            rgba(15, 23, 42, 0.20);

          transition:
            transform 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }


        .synapse-floating-button:hover {
          transform:
            translateY(-2px);

          background:
            var(--primary-hover);

          box-shadow:
            0 12px 30px
            rgba(15, 23, 42, 0.25);
        }


        .synapse-star {
          font-size: 1rem;

          color: #FFFFFF;
        }


        /* ==========================================
           SYNAPSE DRAWER
        ========================================== */

        .synapse-drawer {
          position: fixed;

          top: 0;

          right: 0;

          width:
            min(440px, 92vw);

          height: 100vh;

          z-index: 1999;

          background:
            var(--bg-surface);

          border-left:
            1px solid var(--border-subtle);

          box-shadow:
            -15px 0 45px
            rgba(15, 23, 42, 0.15);

          transform:
            translateX(100%);

          transition:
            transform 0.3s ease;

          overflow: hidden;
        }


        .synapse-drawer-open {
          transform:
            translateX(0);
        }


        /* ==========================================
           SYNAPSE LIGHT THEME VARIABLES
        ========================================== */

        .synapse-drawer {
          --synapse-bg: #FFFFFF;
          --synapse-surface: #F8FAFC;
          --synapse-ice: #DFF3FA;
          --synapse-peach: #FBEDE6;
          --synapse-border: #E3E8EE;
          --synapse-text: #0F172A;
          --synapse-muted: #64748B;
          --synapse-primary: #0F172A;
          --synapse-accent: #38BDF8;
        }


        /* ==========================================
           ANIMATION
        ========================================== */

        @keyframes synapseFadeIn {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }

        }


        /* ==========================================
           MOBILE
        ========================================== */

        @media (max-width: 600px) {

          .synapse-drawer {
            width: 100%;
          }


          .synapse-floating-button {
            right: 1rem;

            bottom: 1rem;

            padding:
              0.75rem 1rem;
          }

        }

      `}</style>

    </div>
  );
}

export default App;