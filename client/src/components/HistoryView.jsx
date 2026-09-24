import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Eye, 
  Calendar, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { 
  getStoredPredictions, 
  deleteStoredPrediction, 
  clearAllStoredPredictions 
} from '../utils/storage';

export default function HistoryView({ onLoadPrediction, onGoToInput }) {
  const [historyList, setHistoryList] = useState([]);

  useEffect(() => {
    setHistoryList(getStoredPredictions());
  }, []);

  const handleDelete = (id, e) => {
    e.stopPropagation();
    const updated = deleteStoredPrediction(id);
    setHistoryList(updated);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear your local prediction history?')) {
      clearAllStoredPredictions();
      setHistoryList([]);
    }
  };

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Safe':
        return <span className="badge badge-safe">Safe</span>;
      case 'At Risk':
        return <span className="badge badge-risk">At Risk</span>;
      default:
        return <span className="badge badge-high-risk">High Risk</span>;
    }
  };

  return (
    <div className="history-view-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>Prediction Session History</h2>
          <p className="view-subtitle">
            Past predictions saved privately in your browser's local storage. Zero logins, zero tracking.
          </p>
        </div>

        {historyList.length > 0 && (
          <button className="btn-danger btn-sm" onClick={handleClearAll}>
            <Trash2 size={14} />
            <span>Clear All History</span>
          </button>
        )}
      </div>

      {historyList.length === 0 ? (
        <div className="glass-card text-center empty-history-card">
          <History size={40} className="empty-history-icon" />
          <h3>No Saved Predictions Yet</h3>
          <p className="text-muted mt-2">
            Every time you run an attendance prediction, your session summary is automatically saved here for quick viewing.
          </p>
          <button className="btn-primary mt-4" onClick={onGoToInput}>
            <span>Run New Prediction</span>
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {historyList.map((item) => (
            <div 
              key={item.id} 
              className="glass-card history-card"
              onClick={() => onLoadPrediction(item)}
            >
              <div className="history-card-header">
                <div className="history-date">
                  <Calendar size={14} className="text-cyan" />
                  <span>{formatDate(item.timestamp)}</span>
                </div>
                {getRiskBadge(item.risk_level)}
              </div>

              <div className="history-student-info">
                <span className="history-student-name">
                  {item.student_info?.name || 'Anonymous Student'}
                </span>
                <span className="history-student-meta">
                  {item.student_info?.department || 'Dept'} • Year {item.student_info?.year} (Sem {item.student_info?.semester})
                </span>
              </div>

              <div className="history-metrics-row">
                <div className="history-metric">
                  <span className="h-metric-label">Current</span>
                  <span className="h-metric-val">{Number(item.current_attendance).toFixed(1)}%</span>
                </div>
                <div className="h-divider"></div>
                <div className="history-metric">
                  <span className="h-metric-label">September</span>
                  <span className="h-metric-val text-cyan">{Number(item.september_prediction).toFixed(1)}%</span>
                </div>
                <div className="h-divider"></div>
                <div className="history-metric">
                  <span className="h-metric-label">October</span>
                  <span className="h-metric-val text-purple">{Number(item.october_forecast).toFixed(1)}%</span>
                </div>
              </div>

              <div className="history-card-footer">
                <button 
                  className="btn-outline btn-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLoadPrediction(item);
                  }}
                >
                  <Eye size={12} />
                  <span>View Dashboard</span>
                </button>
                <button 
                  className="btn-icon-delete"
                  onClick={(e) => handleDelete(item.id, e)}
                  title="Delete this record"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .history-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .empty-history-card {
          padding: 3.5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .empty-history-icon {
          color: #475569;
          margin-bottom: 1rem;
        }
        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
        }
        .history-card {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding: 1.25rem;
          cursor: pointer;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .history-card:hover {
          transform: translateY(-2px);
          border-color: rgba(56, 189, 248, 0.4);
        }
        .history-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .history-date {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.78rem;
          color: var(--text-muted);
        }
        .history-student-info {
          display: flex;
          flex-direction: column;
        }
        .history-student-name {
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--text-main);
        }
        .history-student-meta {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .history-metrics-row {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: #0B1322;
          border: 1px solid #1E293B;
          border-radius: var(--radius-sm);
          padding: 0.65rem 0.5rem;
        }
        .history-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .h-metric-label {
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--text-dim);
        }
        .h-metric-val {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 1.05rem;
        }
        .h-divider {
          width: 1px;
          height: 24px;
          background: #1E293B;
        }
        .history-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 0.4rem;
          border-top: 1px solid rgba(148, 163, 184, 0.08);
        }
        .btn-xs {
          padding: 0.3rem 0.65rem;
          font-size: 0.75rem;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-icon-delete {
          background: transparent;
          color: var(--text-dim);
          padding: 0.4rem;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon-delete:hover {
          color: #EF4444;
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
}
