import React, { useMemo, useState } from 'react';
import {
  CalendarX,
  Play,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

import { simulateLeave } from '../services/api';

export default function LeaveSimulatorView({
  student,
  subjects,
  currentPrediction,
  onGoToInput
}) {
  const [classesToMiss, setClassesToMiss] = useState(3);
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const activeSim =
    simulationData ||
    currentPrediction?.leave_trajectory ||
    null;

  const handleSimulate = async (missCount = classesToMiss) => {
    if (!subjects || subjects.length === 0) {
      setErrorMsg('Please enter attendance details first.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const result = await simulateLeave(
        student || {},
        subjects || [],
        missCount
      );

      setSimulationData(result);
    } catch (error) {
      console.error(error);
      setErrorMsg(
        error?.message ||
        'Unable to simulate leave right now.'
      );
    } finally {
      setLoading(false);
    }
  };

  const trajectory = useMemo(() => {
    const data =
      activeSim?.trajectory ||
      activeSim?.data ||
      [];

    if (!Array.isArray(data)) return [];

    return data.map((item, index) => ({
      classes: Number(
        item?.classes_missed ??
        item?.missed ??
        item?.classes ??
        index
      ),
      attendance: Number(
        item?.attendance ??
        item?.percentage ??
        item?.overall_attendance ??
        0
      )
    }));
  }, [activeSim]);

  const risk = String(
    activeSim?.risk_level ||
    activeSim?.risk ||
    currentPrediction?.risk_level ||
    'At Risk'
  );

  const finalAttendance = Number(
    activeSim?.final_attendance ??
    activeSim?.attendance ??
    activeSim?.projected_attendance ??
    0
  );

  const currentAttendance = Number(
    currentPrediction?.current_attendance?.overall_attendance ??
    currentPrediction?.current_attendance?.percentage ??
    0
  );

  const safeLeave = Number(
    currentPrediction?.maximum_safe_leave ??
    activeSim?.maximum_safe_leave ??
    0
  );

  const getRiskClass = () => {
    const value = risk.toLowerCase();

    if (value.includes('high')) return 'leave-risk-high';
    if (value.includes('safe')) return 'leave-risk-safe';

    return 'leave-risk-warning';
  };

  const getRiskIcon = () => {
    const value = risk.toLowerCase();

    if (value.includes('high')) {
      return <AlertOctagon size={18} />;
    }

    if (value.includes('safe')) {
      return <ShieldCheck size={18} />;
    }

    return <AlertTriangle size={18} />;
  };

  return (
    <div className="leave-page animate-fade-in">

      <div className="leave-header">

        <button
          type="button"
          className="leave-back-btn"
          onClick={onGoToInput}
        >
          <ArrowLeft size={17} />
          Edit Attendance
        </button>

        <div className="leave-title">
          <div className="leave-title-icon">
            <CalendarX size={22} />
          </div>

          <div>
            <h1>Leave Simulator</h1>
            <p>
              See how missing classes could affect your attendance.
            </p>
          </div>
        </div>

      </div>


      {errorMsg && (
        <div className="leave-error">
          <AlertTriangle size={18} />
          {errorMsg}
        </div>
      )}


      <section className="leave-control-card">

        <div>
          <span className="leave-section-label">
            Classes you plan to miss
          </span>

          <div className="leave-number-row">
            <input
              type="number"
              min="0"
              max="100"
              value={classesToMiss}
              onChange={(e) =>
                setClassesToMiss(
                  Math.max(0, Number(e.target.value))
                )
              }
            />

            <span>classes</span>
          </div>
        </div>


        <div className="leave-slider-wrap">

          <input
            type="range"
            min="0"
            max="20"
            value={classesToMiss}
            onChange={(e) =>
              setClassesToMiss(Number(e.target.value))
            }
            className="leave-slider"
          />

          <div className="leave-slider-labels">
            <span>0</span>
            <span>10</span>
            <span>20</span>
          </div>

        </div>


        <button
          type="button"
          className="btn-primary leave-simulate-btn"
          onClick={() => handleSimulate()}
          disabled={loading}
        >
          <Play size={17} />

          {loading
            ? 'Simulating...'
            : 'Simulate Leave'}
        </button>

      </section>


      <section className="leave-safe-card">

        <div className="leave-safe-icon">
          <ShieldCheck size={23} />
        </div>

        <div>
          <span>Maximum Safe Leave</span>

          <strong>
            {safeLeave} classes
          </strong>

          <p>
            Based on the current attendance prediction.
          </p>
        </div>

      </section>


      {activeSim && (
        <>

          <div className="leave-outcomes">

            <div className="leave-outcome-card">
              <span>Current Attendance</span>
              <strong>
                {currentAttendance.toFixed(2)}%
              </strong>
            </div>

            <div className="leave-outcome-card leave-outcome-highlight">
              <span>After {classesToMiss} Classes</span>
              <strong>
                {finalAttendance.toFixed(2)}%
              </strong>
            </div>

            <div className="leave-outcome-card">
              <span>Change</span>
              <strong>
                {(finalAttendance - currentAttendance).toFixed(2)}%
              </strong>
            </div>

            <div className="leave-outcome-card">
              <span>Risk</span>

              <strong className={`leave-risk-text ${getRiskClass()}`}>
                {getRiskIcon()}
                {risk}
              </strong>
            </div>

          </div>


          {trajectory.length > 0 && (
            <section className="leave-chart-card">

              <div className="leave-chart-header">
                <div>
                  <h2>Leave Impact</h2>
                  <p>
                    Projected attendance as missed classes increase.
                  </p>
                </div>

                {finalAttendance < currentAttendance ? (
                  <TrendingDown className="leave-chart-down" />
                ) : (
                  <TrendingUp className="leave-chart-up" />
                )}
              </div>

              <div className="leave-chart">
                <ResponsiveContainer width="100%" height={330}>
                  <LineChart data={trajectory}>

                    <CartesianGrid
                      stroke="#E3E8EE"
                      strokeDasharray="4 4"
                    />

                    <XAxis
                      dataKey="classes"
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={{ stroke: '#E3E8EE' }}
                      tickLine={false}
                    />

                    <YAxis
                      domain={[50, 100]}
                      tick={{ fill: '#64748B', fontSize: 12 }}
                      axisLine={{ stroke: '#E3E8EE' }}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background: '#FFFFFF',
                        border: '1px solid #E3E8EE',
                        borderRadius: '10px',
                        boxShadow: '0 8px 25px rgba(15,23,42,.10)'
                      }}
                      labelStyle={{
                        color: '#0F172A',
                        fontWeight: 700
                      }}
                    />

                    <ReferenceLine
                      y={75}
                      stroke="#10B981"
                      strokeDasharray="6 4"
                    />

                    <ReferenceLine
                      y={65}
                      stroke="#EF4444"
                      strokeDasharray="6 4"
                    />

                    <Line
                      type="monotone"
                      dataKey="attendance"
                      stroke="#0F172A"
                      strokeWidth={3}
                      dot={{
                        fill: '#DFF3FA',
                        stroke: '#0F172A',
                        strokeWidth: 2,
                        r: 4
                      }}
                    />

                  </LineChart>
                </ResponsiveContainer>
              </div>

            </section>
          )}

        </>
      )}


      <div className="leave-disclaimer">
        <strong>Note:</strong> This simulator provides an estimate
        based on your current attendance data. Actual attendance
        may vary depending on future class schedules.
      </div>


      <style>{`

        .leave-page {
          width: min(1150px, 92%);
          margin: 0 auto;
          padding: 2rem 0 4rem;
        }

        .leave-header {
          margin-bottom: 1.5rem;
        }

        .leave-back-btn {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          padding: .3rem 0;
          margin-bottom: 1rem;
        }

        .leave-back-btn:hover {
          color: var(--primary);
        }

        .leave-title {
          display: flex;
          align-items: center;
          gap: .8rem;
        }

        .leave-title-icon {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: linear-gradient(
            135deg,
            var(--bg-ice),
            var(--bg-peach)
          );
          color: var(--primary);
          border: 1px solid var(--border-card);
        }

        .leave-title h1 {
          margin: 0;
          color: var(--text-main);
        }

        .leave-title p {
          margin: .35rem 0 0;
          color: var(--text-muted);
        }

        .leave-error {
          display: flex;
          align-items: center;
          gap: .5rem;
          padding: .85rem 1rem;
          margin-bottom: 1rem;
          color: #B91C1C;
          background: var(--high-risk-bg);
          border: 1px solid var(--high-risk-border);
          border-radius: 10px;
        }

        .leave-control-card,
        .leave-chart-card,
        .leave-outcome-card {
          background: #fff;
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(15,23,42,.045);
        }

        .leave-control-card {
          padding: 1.3rem;
          display: grid;
          grid-template-columns: 1fr 2fr auto;
          gap: 1.3rem;
          align-items: center;
        }

        .leave-section-label {
          display: block;
          color: var(--text-muted);
          font-size: .78rem;
          margin-bottom: .45rem;
        }

        .leave-number-row {
          display: flex;
          align-items: center;
          gap: .5rem;
        }

        .leave-number-row input {
          width: 80px;
          padding: .65rem;
          border: 1px solid var(--border-card);
          border-radius: 8px;
          color: var(--text-main);
          background: #fff;
          font-size: 1rem;
        }

        .leave-number-row span {
          color: var(--text-muted);
        }

        .leave-slider {
          width: 100%;
          accent-color: var(--primary);
        }

        .leave-slider-labels {
          display: flex;
          justify-content: space-between;
          color: var(--text-dim);
          font-size: .72rem;
          margin-top: .25rem;
        }

        .leave-simulate-btn {
          display: inline-flex;
          align-items: center;
          gap: .45rem;
          white-space: nowrap;
        }

        .leave-safe-card {
          margin-top: 1rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.2rem;
          border-radius: 16px;
          background: linear-gradient(
            135deg,
            var(--safe-bg),
            #FFFFFF
          );
          border: 1px solid var(--safe-border);
        }

        .leave-safe-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: #FFFFFF;
          color: var(--safe);
          border: 1px solid var(--safe-border);
        }

        .leave-safe-card span {
          display: block;
          color: #047857;
          font-size: .8rem;
        }

        .leave-safe-card strong {
          display: block;
          color: var(--text-main);
          font-size: 1.45rem;
          margin-top: .1rem;
        }

        .leave-safe-card p {
          margin: .2rem 0 0;
          color: var(--text-muted);
          font-size: .8rem;
        }

        .leave-outcomes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          margin-top: 1rem;
        }

        .leave-outcome-card {
          padding: 1.1rem;
        }

        .leave-outcome-card span {
          display: block;
          color: var(--text-muted);
          font-size: .78rem;
          margin-bottom: .35rem;
        }

        .leave-outcome-card > strong {
          color: var(--text-main);
          font-size: 1.25rem;
        }

        .leave-outcome-highlight {
          background: linear-gradient(
            135deg,
            var(--bg-ice),
            #FFFFFF
          );
          border-color: var(--accent-border);
        }

        .leave-risk-text {
          display: inline-flex;
          align-items: center;
          gap: .35rem;
          font-size: 1rem !important;
        }

        .leave-risk-safe {
          color: var(--safe) !important;
        }

        .leave-risk-warning {
          color: var(--risk) !important;
        }

        .leave-risk-high {
          color: var(--high-risk) !important;
        }

        .leave-chart-card {
          margin-top: 1rem;
          padding: 1.25rem;
        }

        .leave-chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .leave-chart-header h2 {
          margin: 0;
          color: var(--text-main);
          font-size: 1.05rem;
        }

        .leave-chart-header p {
          margin: .3rem 0 0;
          color: var(--text-muted);
          font-size: .82rem;
        }

        .leave-chart-down {
          color: var(--high-risk);
        }

        .leave-chart-up {
          color: var(--safe);
        }

        .leave-chart {
          margin-top: 1rem;
        }

        .leave-disclaimer {
          margin-top: 1rem;
          padding: 1rem;
          color: var(--text-muted);
          background: #F8FAFC;
          border: 1px dashed var(--border-card);
          border-radius: 12px;
          font-size: .78rem;
          line-height: 1.5;
        }

        .leave-disclaimer strong {
          color: var(--text-main);
        }

        @media (max-width: 850px) {
          .leave-control-card {
            grid-template-columns: 1fr;
          }

          .leave-outcomes {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 520px) {
          .leave-outcomes {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

    </div>
  );
}