import { useState } from 'react';
import './index.css';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import InputView from './components/InputView';
import DashboardView from './components/DashboardView';
import LeaveSimulatorView from './components/LeaveSimulatorView';
import HistoryView from './components/HistoryView';
import AboutMlView from './components/AboutMlView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');

  // Shared app state — no login, no accounts
  const [predictionData, setPredictionData] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentSubjects, setCurrentSubjects] = useState([]);

  // Called when InputView runs a successful prediction
  const handlePredictionComplete = (result, student, subjects) => {
    setPredictionData(result);
    setCurrentStudent(student);
    setCurrentSubjects(subjects);
    setActiveTab('dashboard');
  };

  // Load a history session into the dashboard
  const handleLoadHistorySession = (item) => {
    setPredictionData(item);
    setCurrentStudent(item.student_info || {});
    setCurrentSubjects(
      (item.subject_breakdown || []).map((s) => ({
        name: s.name,
        conducted: s.conducted,
        attended: s.attended,
      }))
    );
    setActiveTab('dashboard');
  };

  const renderView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onStart={() => setActiveTab('input')} />;

      case 'input':
        return (
          <InputView
            onPredictionComplete={handlePredictionComplete}
            initialData={predictionData}
          />
        );

      case 'dashboard':
        return (
          <DashboardView
            predictionData={predictionData}
            onEditAttendance={() => setActiveTab('input')}
            onOpenLeaveSimulator={() => setActiveTab('leave')}
          />
        );

      case 'leave':
        return (
          <LeaveSimulatorView
            student={currentStudent}
            subjects={currentSubjects}
            currentPrediction={predictionData}
            onGoToInput={() => setActiveTab('input')}
          />
        );

      case 'history':
        return (
          <HistoryView
            onLoadPrediction={handleLoadHistorySession}
            onGoToInput={() => setActiveTab('input')}
          />
        );

      case 'about':
        return <AboutMlView />;

      default:
        return <HomeView onStart={() => setActiveTab('input')} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasPredictionData={!!predictionData}
      />

      <main className="main-content">
        {renderView()}
      </main>

      <footer className="app-footer">
        <p>
          <span className="footer-brand">SMART ATTENDANCE AI</span>
          {' '}— Powered by a trained scikit-learn Random Forest Regressor.
          No login required. All predictions computed in real-time.
        </p>
        <p className="footer-disclaimer">
          Risk thresholds are rule-based. October is an exploratory future forecast and is not a trained or validated target.
        </p>
      </footer>

      <style>{`
        .app-footer {
          border-top: 1px solid var(--border-subtle);
          padding: 1.5rem 2rem;
          text-align: center;
          color: var(--text-dim);
          font-size: 0.8rem;
          background: rgba(9, 13, 22, 0.8);
        }
        .footer-brand {
          font-family: var(--font-heading);
          font-weight: 700;
          color: var(--primary);
        }
        .footer-disclaimer {
          margin-top: 0.35rem;
          font-size: 0.73rem;
          color: #334155;
        }
      `}</style>
    </div>
  );
}
