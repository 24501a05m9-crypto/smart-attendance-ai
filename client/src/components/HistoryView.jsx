import React, { useEffect, useState } from 'react';
import {
  History,
  Trash2,
  Eye,
  Calendar,
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

export default function HistoryView({
  onLoadPrediction,
  onGoToInput
}) {
  const [predictions, setPredictions] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    const stored = getStoredPredictions();
    setPredictions(Array.isArray(stored) ? stored : []);
  };

  const handleDelete = (id) => {
    deleteStoredPrediction(id);
    loadHistory();
  };

  const handleClear = () => {
    clearAllStoredPredictions();
    setPredictions([]);
    setShowConfirm(false);
  };

  const getPredictionData = (item) =>
    item?.predictionData ||
    item?.prediction_data ||
    item;

  const getAttendance = (item) => {
    const data = getPredictionData(item);

    return Number(
      data?.current_attendance?.overall_attendance ??
      data?.current_attendance?.percentage ??
      data?.overall_attendance ??
      0
    );
  };

  const getRisk = (item) => {
    const data = getPredictionData(item);

    return (
      data?.risk_level ||
      data?.risk ||
      'Unknown'
    );
  };

  const getRiskIcon = (risk) => {
    const value = String(risk).toLowerCase();

    if (value.includes('high')) {
      return <AlertOctagon size={17} />;
    }

    if (value.includes('risk')) {
      return <AlertTriangle size={17} />;
    }

    return <ShieldCheck size={17} />;
  };

  const getRiskClass = (risk) => {
    const value = String(risk).toLowerCase();

    if (value.includes('high')) return 'history-risk-high';
    if (value.includes('risk')) return 'history-risk-medium';

    return 'history-risk-safe';
  };

  const formatDate = (item) => {
    const date =
      item?.createdAt ||
      item?.created_at ||
      item?.timestamp ||
      item?.date;

    if (!date) return 'Previous prediction';

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return 'Previous prediction';
    }

    return parsed.toLocaleString();
  };

  return (
    <div className="history-page animate-fade-in">

      <div className="history-header">
        <div>
          <div className="history-title-row">
            <div className="history-title-icon">
              <History size={21} />
            </div>

            <h1>Prediction History</h1>
          </div>

          <p>
            View and reopen your previous attendance predictions.
          </p>
        </div>

        {predictions.length > 0 && (
          <button
            type="button"
            className="history-clear-btn"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 size={16} />
            Clear History
          </button>
        )}
      </div>


      {predictions.length === 0 ? (

        <section className="history-empty">

          <div className="history-empty-icon">
            <History size={34} />
          </div>

          <h2>No prediction history</h2>

          <p>
            Your attendance predictions will appear here after
            you complete a prediction.
          </p>

          <button
            type="button"
            className="btn-primary history-start-btn"
            onClick={onGoToInput}
          >
            <Sparkles size={17} />
            Run New Prediction
            <ArrowRight size={17} />
          </button>

        </section>

      ) : (

        <div className="history-list">

          {predictions.map((item, index) => {

            const attendance = getAttendance(item);
            const risk = getRisk(item);

            const id =
              item?.id ??
              item?.timestamp ??
              index;

            return (
              <article
                className="history-card"
                key={id}
              >

                <div className="history-card-top">

                  <div className="history-date">
                    <Calendar size={16} />
                    {formatDate(item)}
                  </div>

                  <span
                    className={`history-risk ${getRiskClass(risk)}`}
                  >
                    {getRiskIcon(risk)}
                    {risk}
                  </span>

                </div>


                <div className="history-metrics-row">

                  <div className="history-metric">
                    <span>Attendance</span>
                    <strong>
                      {attendance.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="history-divider" />

                  <div className="history-metric">
                    <span>Subjects</span>
                    <strong>
                      {
                        getPredictionData(item)
                          ?.subject_breakdown
                          ?.length ?? 0
                      }
                    </strong>
                  </div>

                </div>


                <div className="history-card-actions">

                  <button
                    type="button"
                    className="history-view-btn"
                    onClick={() => onLoadPrediction(item)}
                  >
                    <Eye size={16} />
                    View Prediction
                  </button>

                  <button
                    type="button"
                    className="history-delete-btn"
                    onClick={() => handleDelete(id)}
                    aria-label="Delete prediction"
                  >
                    <Trash2 size={16} />
                  </button>

                </div>

              </article>
            );
          })}

        </div>
      )}


      {showConfirm && (
        <div className="history-confirm-overlay">

          <div className="history-confirm">

            <div className="history-confirm-icon">
              <Trash2 size={22} />
            </div>

            <h3>Clear prediction history?</h3>

            <p>
              This will permanently remove all saved prediction
              history from this browser.
            </p>

            <div className="history-confirm-actions">

              <button
                type="button"
                className="history-cancel-btn"
                onClick={() => setShowConfirm(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="history-confirm-delete"
                onClick={handleClear}
              >
                Clear History
              </button>

            </div>

          </div>

        </div>
      )}


      <style>{`

        .history-page {
          width: min(1100px, 92%);
          margin: 0 auto;
          padding: 2.5rem 0 4rem;
        }

        .history-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 1.8rem;
        }

        .history-title-row {
          display: flex;
          align-items: center;
          gap: .75rem;
        }

        .history-title-icon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--bg-ice);
          color: var(--primary);
          border: 1px solid var(--accent-border);
        }

        .history-header h1 {
          margin: 0;
          color: var(--text-main);
          font-size: 1.8rem;
        }

        .history-header p {
          margin: .55rem 0 0;
          color: var(--text-muted);
        }

        .history-clear-btn,
        .history-view-btn,
        .history-delete-btn,
        .history-cancel-btn,
        .history-confirm-delete {
          border: 1px solid var(--border-card);
          cursor: pointer;
          font-family: inherit;
          transition: .2s ease;
        }

        .history-clear-btn {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          padding: .7rem 1rem;
          border-radius: 9px;
          background: #fff;
          color: var(--high-risk);
        }

        .history-clear-btn:hover {
          background: var(--high-risk-bg);
          border-color: var(--high-risk-border);
        }

        .history-empty {
          padding: 4rem 1.5rem;
          text-align: center;
          background: #fff;
          border: 1px solid var(--border-card);
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(15,23,42,.05);
        }

        .history-empty-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto 1.2rem;
          display: grid;
          place-items: center;
          border-radius: 20px;
          background: linear-gradient(
            135deg,
            var(--bg-ice),
            var(--bg-peach)
          );
          color: var(--primary);
        }

        .history-empty h2 {
          margin: 0;
          color: var(--text-main);
        }

        .history-empty p {
          max-width: 480px;
          margin: .7rem auto 1.5rem;
          color: var(--text-muted);
          line-height: 1.6;
        }

        .history-start-btn {
          display: inline-flex;
          align-items: center;
          gap: .5rem;
        }

        .history-list {
          display: grid;
          gap: 1rem;
        }

        .history-card {
          background: #fff;
          border: 1px solid var(--border-card);
          border-radius: 16px;
          padding: 1.15rem;
          box-shadow: 0 8px 24px rgba(15,23,42,.045);
          transition: .2s ease;
        }

        .history-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-border);
          box-shadow: 0 12px 30px rgba(15,23,42,.08);
        }

        .history-card-top,
        .history-card-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }

        .history-date {
          display: flex;
          align-items: center;
          gap: .45rem;
          color: var(--text-muted);
          font-size: .85rem;
        }

        .history-risk {
          display: inline-flex;
          align-items: center;
          gap: .35rem;
          padding: .38rem .65rem;
          border-radius: 999px;
          font-size: .78rem;
          font-weight: 700;
        }

        .history-risk-safe {
          color: #047857;
          background: var(--safe-bg);
          border: 1px solid var(--safe-border);
        }

        .history-risk-medium {
          color: #B45309;
          background: var(--risk-bg);
          border: 1px solid var(--risk-border);
        }

        .history-risk-high {
          color: #B91C1C;
          background: var(--high-risk-bg);
          border: 1px solid var(--high-risk-border);
        }

        .history-metrics-row {
          display: flex;
          align-items: center;
          margin: 1.2rem 0;
          padding: 1rem;
          background: var(--bg-ice);
          border: 1px solid var(--accent-border);
          border-radius: 12px;
        }

        .history-metric {
          flex: 1;
        }

        .history-metric span {
          display: block;
          color: var(--text-muted);
          font-size: .78rem;
          margin-bottom: .25rem;
        }

        .history-metric strong {
          color: var(--text-main);
          font-size: 1.25rem;
        }

        .history-divider {
          width: 1px;
          height: 35px;
          background: var(--border-card);
          margin: 0 1rem;
        }

        .history-view-btn {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          padding: .65rem .9rem;
          border-radius: 8px;
          background: var(--primary);
          color: #fff;
        }

        .history-view-btn:hover {
          background: var(--primary-hover);
        }

        .history-delete-btn {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #fff;
          color: var(--high-risk);
        }

        .history-delete-btn:hover {
          background: var(--high-risk-bg);
          border-color: var(--high-risk-border);
        }

        .history-confirm-overlay {
          position: fixed;
          inset: 0;
          z-index: 3000;
          display: grid;
          place-items: center;
          padding: 1rem;
          background: rgba(15,23,42,.3);
          backdrop-filter: blur(4px);
        }

        .history-confirm {
          width: min(420px, 100%);
          padding: 1.5rem;
          background: #fff;
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow: 0 25px 60px rgba(15,23,42,.18);
        }

        .history-confirm-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: var(--high-risk-bg);
          color: var(--high-risk);
        }

        .history-confirm h3 {
          margin: 1rem 0 .4rem;
          color: var(--text-main);
        }

        .history-confirm p {
          color: var(--text-muted);
          line-height: 1.5;
        }

        .history-confirm-actions {
          display: flex;
          justify-content: flex-end;
          gap: .7rem;
          margin-top: 1.3rem;
        }

        .history-cancel-btn,
        .history-confirm-delete {
          padding: .65rem .9rem;
          border-radius: 8px;
        }

        .history-cancel-btn {
          background: #fff;
          color: var(--text-main);
        }

        .history-cancel-btn:hover {
          background: #F8FAFC;
        }

        .history-confirm-delete {
          background: var(--high-risk);
          color: #fff;
          border-color: var(--high-risk);
        }

        @media (max-width: 650px) {
          .history-header {
            flex-direction: column;
          }

          .history-clear-btn {
            width: 100%;
            justify-content: center;
          }
        }

      `}</style>

    </div>
  );
}