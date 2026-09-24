import React, { useState } from 'react';
import { 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  AlertOctagon, 
  HelpCircle, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Info,
  CalendarX 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine 
} from 'recharts';
import { simulateLeave } from '../services/api';

export default function LeaveSimulatorView({ student, subjects, currentPrediction, onGoToInput }) {
  const [classesToMiss, setClassesToMiss] = useState(3);
  const [loading, setLoading] = useState(false);
  const [simulationData, setSimulationData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!subjects || subjects.length === 0) {
    return (
      <div className="glass-card text-center p-8">
        <h3>No Attendance Data Entered</h3>
        <p className="text-muted mt-2">Please enter your subject attendance first to run the leave impact simulator.</p>
        <button className="btn-primary mt-4" onClick={onGoToInput}>
          Enter Attendance Details
        </button>
      </div>
    );
  }

  // Run simulation
  const handleSimulate = async (missCount) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const count = Number(missCount);
      const res = await simulateLeave(student, subjects, count);
      setSimulationData(res);
    } catch (err) {
      console.error('Leave simulation failed:', err);
      setErrorMsg(err.message || 'Leave simulation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger initial simulation or load from currentPrediction trajectory
  const activeSim = simulationData || (currentPrediction?.leave_trajectory ? {
    current_attendance: currentPrediction.current_attendance,
    classes_missed: classesToMiss,
    attendance_after_leave: currentPrediction.leave_trajectory.find(t => t.classes_missed === classesToMiss)?.attendance_after_leave || 67.44,
    predicted_future_attendance: currentPrediction.leave_trajectory.find(t => t.classes_missed === classesToMiss)?.predicted_future_attendance || 74.2,
    risk_level: currentPrediction.leave_trajectory.find(t => t.classes_missed === classesToMiss)?.risk_level || 'At Risk',
    maximum_safe_leave: currentPrediction.maximum_safe_leave,
    max_safe_leave_message: currentPrediction.max_safe_leave_message,
    trajectory: currentPrediction.leave_trajectory
  } : null);

  const trajectoryChartData = (activeSim?.trajectory || []).map(item => ({
    missed: `${item.classes_missed}`,
    missedNum: item.classes_missed,
    predicted: item.predicted_future_attendance,
    immediate: item.attendance_after_leave
  }));

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Safe':
        return (
          <span className="badge badge-safe">
            <ShieldCheck size={14} />
            <span>Safe (≥ 75%)</span>
          </span>
        );
      case 'At Risk':
        return (
          <span className="badge badge-risk">
            <AlertTriangle size={14} />
            <span>At Risk (65% - 74%)</span>
          </span>
        );
      default:
        return (
          <span className="badge badge-high-risk">
            <AlertOctagon size={14} />
            <span>High Risk (&lt; 65%)</span>
          </span>
        );
    }
  };

  return (
    <div className="leave-simulator-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>Leave Impact Simulator</h2>
          <p className="view-subtitle">
            "Can I Take Leave?" — Evaluate how missing upcoming classes alters your future attendance projection.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="glass-card error-bar">
          <AlertOctagon size={18} className="text-rose" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Control Box */}
      <div className="glass-card leave-control-card">
        <div className="control-left">
          <div className="control-label-group">
            <span className="control-title">CAN I TAKE LEAVE?</span>
            <span className="control-desc">Select how many upcoming classes you are planning to miss:</span>
          </div>

          <div className="slider-input-group">
            <input 
              type="range" 
              min="0" 
              max="15" 
              value={classesToMiss}
              onChange={(e) => {
                const val = Number(e.target.value);
                setClassesToMiss(val);
                handleSimulate(val);
              }}
              className="leave-range-slider"
            />
            
            <div className="number-picker">
              <span className="picker-label">Classes to miss:</span>
              <input
                type="number"
                min="0"
                max="20"
                value={classesToMiss}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value));
                  setClassesToMiss(val);
                }}
                className="form-input picker-input"
              />
              <button 
                className="btn-primary btn-sm"
                onClick={() => handleSimulate(classesToMiss)}
                disabled={loading}
              >
                {loading ? <RefreshCw size={14} className="spin-icon" /> : 'Simulate Leave'}
              </button>
            </div>
          </div>
        </div>

        {/* Max Safe Leave Callout Box */}
        <div className="max-safe-box">
          <div className="safe-icon-row">
            <ShieldCheck size={20} className="text-emerald" />
            <span className="safe-box-label">MAXIMUM SAFE LEAVE</span>
          </div>
          <div className="safe-box-number">
            {activeSim?.maximum_safe_leave ?? currentPrediction?.maximum_safe_leave ?? 0} <span className="classes-text">Classes</span>
          </div>
          <p className="safe-box-desc">
            "Based on the model forecast." You can safely miss up to {activeSim?.maximum_safe_leave ?? currentPrediction?.maximum_safe_leave ?? 0} classes while keeping predicted future attendance &ge; 75%.
          </p>
        </div>
      </div>

      {/* 4 Outcome Metrics Grid (Section 10) */}
      <div className="outcomes-grid">
        <div className="glass-card outcome-card">
          <span className="outcome-title">Current Attendance</span>
          <span className="outcome-val">{Number(activeSim?.current_attendance || currentPrediction?.current_attendance || 0).toFixed(1)}%</span>
          <span className="outcome-note">Baseline attendance prior to taking leave</span>
        </div>

        <div className="glass-card outcome-card">
          <span className="outcome-title">After Leave</span>
          <span className="outcome-val text-amber">{Number(activeSim?.attendance_after_leave || 0).toFixed(1)}%</span>
          <span className="outcome-note">Direct immediate attendance drop</span>
        </div>

        <div className="glass-card outcome-card highlight-outcome">
          <span className="outcome-title">Predicted Future Attendance</span>
          <span className="outcome-val text-cyan">{Number(activeSim?.predicted_future_attendance || 0).toFixed(1)}%</span>
          <span className="outcome-note">Recalibrated ML Random Forest model forecast</span>
        </div>

        <div className="glass-card outcome-card">
          <span className="outcome-title">Projected Risk</span>
          <div className="mt-2">
            {getRiskBadge(activeSim?.risk_level || 'Safe')}
          </div>
          <span className="outcome-note">Threshold applied after ML leave simulation</span>
        </div>
      </div>

      {/* Trajectory Curve Visualization */}
      <div className="glass-card trajectory-card">
        <div className="trajectory-header">
          <div>
            <h3 className="trajectory-title">Leave Sensitivity Trajectory</h3>
            <p className="trajectory-subtitle">
              Visualizing future attendance decline as classes missed increases from 0 to 10
            </p>
          </div>
          <span className="badge badge-safe">75% Safe Boundary</span>
        </div>

        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trajectoryChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="missed" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} label={{ value: 'Classes Missed', position: 'insideBottom', offset: -5, fill: '#64748B', fontSize: 11 }} />
              <YAxis domain={[50, 100]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} unit="%" />
              <Tooltip 
                contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                formatter={(val, name) => [
                  `${val}%`, 
                  name === 'predicted' ? 'Predicted Future Attendance' : 'Immediate Attendance Drop'
                ]}
              />
              <ReferenceLine y={75} stroke="#10B981" strokeDasharray="4 4" label={{ value: '75% Minimum Safe Boundary', fill: '#10B981', fontSize: 11, position: 'insideTopRight' }} />
              <ReferenceLine y={65} stroke="#EF4444" strokeDasharray="4 4" label={{ value: '65% High Risk Boundary', fill: '#EF4444', fontSize: 11, position: 'insideBottomRight' }} />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke="#38BDF8" 
                strokeWidth={3} 
                dot={{ r: 5, fill: '#0284C7' }} 
                activeDot={{ r: 7 }}
                name="predicted"
              />
              <Line 
                type="monotone" 
                dataKey="immediate" 
                stroke="#F59E0B" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#F59E0B' }} 
                name="immediate"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="leave-disclaimer">
          <Info size={14} className="text-cyan" />
          <span>Important Notice: This simulation is based on mathematical and machine learning modeling of historical attendance trends. It does not constitute official permission or guaranteed approval from your college administration.</span>
        </div>
      </div>

      <style>{`
        .leave-simulator-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .error-bar {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #F87171;
          padding: 0.85rem 1.25rem;
          border-color: rgba(239, 68, 68, 0.3);
        }
        .leave-control-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
          padding: 2rem;
        }
        .control-left {
          flex: 1;
          min-width: 300px;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .control-title {
          font-family: var(--font-heading);
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--primary);
          display: block;
        }
        .control-desc {
          font-size: 0.92rem;
          color: var(--text-muted);
        }
        .slider-input-group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .leave-range-slider {
          width: 100%;
          accent-color: var(--primary);
          height: 8px;
          cursor: pointer;
        }
        .number-picker {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .picker-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .picker-input {
          width: 75px;
          text-align: center;
          font-weight: 700;
          font-family: var(--font-mono);
          padding: 0.45rem 0.5rem;
        }
        .max-safe-box {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(6, 78, 59, 0.25) 100%);
          border: 1px solid rgba(16, 185, 129, 0.35);
          border-radius: var(--radius-md);
          padding: 1.5rem;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .safe-icon-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .safe-box-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--safe);
        }
        .safe-box-number {
          font-family: var(--font-heading);
          font-size: 2.2rem;
          font-weight: 800;
          color: #FFFFFF;
          line-height: 1.1;
        }
        .classes-text {
          font-size: 1.1rem;
          color: var(--text-muted);
        }
        .safe-box-desc {
          font-size: 0.8rem;
          color: #A7F3D0;
          line-height: 1.4;
        }

        .outcomes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .outcome-card {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          padding: 1.35rem;
        }
        .highlight-outcome {
          border-color: rgba(56, 189, 248, 0.4);
          background: linear-gradient(180deg, rgba(19, 29, 49, 0.9) 0%, rgba(14, 30, 58, 0.6) 100%);
        }
        .outcome-title {
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          font-weight: 600;
        }
        .outcome-val {
          font-family: var(--font-heading);
          font-size: 2.1rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .outcome-note {
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: auto;
        }

        .trajectory-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.75rem;
        }
        .trajectory-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .trajectory-title {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .trajectory-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .leave-disclaimer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.78rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.08);
          padding: 0.65rem 0.9rem;
          border-radius: var(--radius-sm);
        }
        .spin-icon {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
