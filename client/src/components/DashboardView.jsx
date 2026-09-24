import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Edit3, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  CheckCircle2, 
  SlidersHorizontal 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ReferenceLine, 
  AreaChart, 
  Area 
} from 'recharts';

export default function DashboardView({ predictionData, onEditAttendance, onOpenLeaveSimulator }) {
  const [showFeatures, setShowFeatures] = useState(false);

  if (!predictionData) {
    return (
      <div className="glass-card text-center p-8">
        <h3>No Prediction Data Found</h3>
        <p className="text-muted mt-2">Please enter your subject attendance data to generate forecasts.</p>
        <button className="btn-primary mt-4" onClick={onEditAttendance}>
          Go to Attendance Input
        </button>
      </div>
    );
  }

  const {
    student_info = {},
    current_attendance = 0,
    september_prediction = 0,
    october_forecast = 0,
    risk_level = 'Safe',
    maximum_safe_leave = 0,
    max_safe_leave_message = '',
    subject_breakdown = [],
    feature_summary = {},
    leave_trajectory = []
  } = predictionData;

  // Trajectory line chart data
  const forecastChartData = [
    { name: 'Current', attendance: Number(current_attendance), type: 'Recorded Baseline' },
    { name: 'September Forecast', attendance: Number(september_prediction), type: 'Random Forest Model' },
    { name: 'October Future Forecast', attendance: Number(october_forecast), type: 'Future Projection' },
  ];

  // Leave Impact Chart data
  const leaveChartData = (leave_trajectory.length > 0 ? leave_trajectory : [
    { classes_missed: 0, predicted_future_attendance: september_prediction },
    { classes_missed: 1, predicted_future_attendance: (september_prediction - 1.2) },
    { classes_missed: 2, predicted_future_attendance: (september_prediction - 2.5) },
    { classes_missed: 3, predicted_future_attendance: (september_prediction - 3.8) },
    { classes_missed: 4, predicted_future_attendance: (september_prediction - 5.1) },
    { classes_missed: 5, predicted_future_attendance: (september_prediction - 6.5) },
  ]).map(pt => ({
    classes_missed: `${pt.classes_missed} Missed`,
    classesCount: pt.classes_missed,
    predicted: Number(pt.predicted_future_attendance),
    immediate: Number(pt.attendance_after_leave || pt.predicted_future_attendance)
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
    <div className="dashboard-container animate-fade-in">
      {/* Student Banner */}
      <div className="glass-card student-banner">
        <div className="student-profile-group">
          <div className="student-avatar">
            {(student_info.name || 'S').charAt(0).toUpperCase()}
          </div>
          <div className="student-meta">
            <div className="student-name-row">
              <h3>{student_info.name || 'Anonymous Student'}</h3>
              <span className="roll-pill">{student_info.roll_number || 'Session ID Active'}</span>
            </div>
            <div className="student-tags-row">
              <span className="student-subtag">Dept: <strong>{student_info.department || 'General'}</strong></span>
              <span className="tag-separator">•</span>
              <span className="student-subtag">Year: <strong>{student_info.year}</strong> (Sem {student_info.semester})</span>
              <span className="tag-separator">•</span>
              <span className="student-subtag">Section: <strong>{student_info.section || 'A'}</strong></span>
              <span className="tag-separator">•</span>
              <span className="student-subtag">Cohort: <strong>{feature_summary.cohort || `${student_info.year}-${student_info.semester}`}</strong></span>
            </div>
          </div>
        </div>

        <div className="banner-actions">
          <button className="btn-secondary btn-sm" onClick={onEditAttendance}>
            <Edit3 size={14} />
            <span>Edit Attendance</span>
          </button>
          <button className="btn-primary btn-sm" onClick={onOpenLeaveSimulator}>
            <SlidersHorizontal size={14} />
            <span>Test Leave Simulator</span>
          </button>
        </div>
      </div>

      {/* Top 5 KPI Metric Cards (Section 12) */}
      <div className="kpi-grid">
        {/* 1. Current Attendance */}
        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Current Attendance</span>
            <span className="kpi-chip">Recorded</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number">{Number(current_attendance).toFixed(1)}%</span>
          </div>
          <div className="progress-bar-track">
            <div 
              className={`progress-bar-fill ${current_attendance >= 75 ? 'bg-safe' : current_attendance >= 65 ? 'bg-risk' : 'bg-high-risk'}`} 
              style={{ width: `${Math.min(100, Math.max(0, current_attendance))}%` }}
            />
          </div>
          <span className="kpi-caption">
            {feature_summary.totalAttended} / {feature_summary.totalConducted} classes attended
          </span>
        </div>

        {/* 2. September Forecast */}
        <div className="glass-card kpi-card highlight-card">
          <div className="kpi-header">
            <span className="kpi-title">September Forecast</span>
            <span className="badge badge-safe" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
              ML Regressor
            </span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number text-cyan">{Number(september_prediction).toFixed(1)}%</span>
            <TrendingUp size={22} className="text-cyan" />
          </div>
          <div className="kpi-delta">
            <span>
              {september_prediction >= current_attendance ? '▲ +' : '▼ '}
              {Math.abs(september_prediction - current_attendance).toFixed(1)}% vs Current
            </span>
          </div>
          <span className="kpi-caption">
            Trained Random Forest Model (300 estimators)
          </span>
        </div>

        {/* 3. October Future Forecast */}
        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">October Future Forecast</span>
            <span className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem' }}>
              Projection
            </span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number text-purple">{Number(october_forecast).toFixed(1)}%</span>
          </div>
          <div className="kpi-disclaimer-pill">
            <Info size={12} />
            <span>Exploratory state-forward projection</span>
          </div>
          <span className="kpi-caption">
            Not trained/validated on actual October targets
          </span>
        </div>

        {/* 4. Risk Level */}
        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Risk Level</span>
            <span className="kpi-chip">Rule-Based</span>
          </div>
          <div className="kpi-value-row">
            {getRiskBadge(risk_level)}
          </div>
          <div className="risk-rule-explanation">
            "Risk level is determined using attendance thresholds after the ML prediction."
          </div>
          <span className="kpi-caption">
            Threshold: Safe &ge; 75% | At Risk 65-74% | High Risk &lt; 65%
          </span>
        </div>

        {/* 5. Maximum Safe Leave */}
        <div className="glass-card kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Maximum Safe Leave</span>
            <span className="kpi-chip">ML Forecast</span>
          </div>
          <div className="kpi-value-row">
            <span className="kpi-number text-emerald">
              {maximum_safe_leave} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Classes</span>
            </span>
          </div>
          <p className="safe-leave-text">
            {max_safe_leave_message || `You can safely miss up to ${maximum_safe_leave} classes based on the current forecast.`}
          </p>
          <span className="kpi-caption">
            Based on the model forecast maintaining &ge; 75%.
          </span>
        </div>
      </div>

      {/* Visualizations Section (Section 13) */}
      <div className="charts-grid">
        {/* Attendance Forecast Trajectory */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Attendance Horizon Progression</h3>
              <p className="chart-desc">Current attendance vs ML September forecast & October projection</p>
            </div>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={forecastChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="name" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} />
                <YAxis domain={[50, 100]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} unit="%" />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                  formatter={(val, name, item) => [`${val}%`, `${item.payload.type}`]}
                />
                <ReferenceLine y={75} stroke="#10B981" strokeDasharray="4 4" label={{ value: 'Safe Threshold (75%)', fill: '#10B981', fontSize: 11, position: 'insideTopRight' }} />
                <ReferenceLine y={65} stroke="#EF4444" strokeDasharray="4 4" label={{ value: 'Critical Threshold (65%)', fill: '#EF4444', fontSize: 11, position: 'insideBottomRight' }} />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#38BDF8" 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: '#0284C7', stroke: '#38BDF8', strokeWidth: 2 }} 
                  activeDot={{ r: 8, fill: '#38BDF8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Leave Impact Chart (Section 13) */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Leave Impact Curve</h3>
              <p className="chart-desc">Predicted future attendance as classes missed increases (0 to 10)</p>
            </div>
            <button className="btn-secondary btn-sm" onClick={onOpenLeaveSimulator}>
              <span>Open Simulator</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={leaveChartData} margin={{ top: 20, right: 30, left: 0, bottom: 10 }}>
                <defs>
                  <linearGradient id="leaveImpactGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="classes_missed" stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <YAxis domain={[50, 100]} stroke="#64748B" tick={{ fill: '#94A3B8', fontSize: 12 }} unit="%" />
                <Tooltip 
                  contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#F8FAFC', fontWeight: 600 }}
                  formatter={(val) => [`${val}%`, 'Predicted Future Attendance']}
                />
                <ReferenceLine y={75} stroke="#10B981" strokeDasharray="4 4" label={{ value: '75% Cutoff', fill: '#10B981', fontSize: 11 }} />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#818CF8" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#leaveImpactGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Subject Risk Breakdown Table (Section 14) */}
      <div className="glass-card subjects-section">
        <div className="subject-section-header">
          <div>
            <h3 className="section-title-sm">Subject-Level Risk Breakdown</h3>
            <p className="section-subtitle-sm">
              Supporting rule-based analysis: <strong className="text-emerald">&ge; 75% Safe</strong>, <strong className="text-amber">65-74% At Risk</strong>, <strong className="text-rose">&lt; 65% High Risk</strong>.
            </p>
          </div>
          <span className="badge badge-neutral">Rule-Based Analysis (Not ML)</span>
        </div>

        <div className="table-responsive">
          <table className="subject-breakdown-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Conducted</th>
                <th>Attended</th>
                <th>Missed</th>
                <th>Current %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subject_breakdown.map((sub, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">{sub.name}</td>
                  <td>{sub.conducted}</td>
                  <td>{sub.attended}</td>
                  <td className="text-rose">{sub.missed}</td>
                  <td className="font-mono">{sub.percentage}%</td>
                  <td>
                    {sub.status === 'Safe' ? (
                      <span className="badge badge-safe">Safe</span>
                    ) : sub.status === 'At Risk' ? (
                      <span className="badge badge-risk">At Risk</span>
                    ) : (
                      <span className="badge badge-high-risk">High Risk</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="subject-note">
          <Info size={14} className="text-cyan" />
          <span>Note: Subject-level status is a supporting rule-based feature for classroom guidance. It is distinct from the overall ML prediction model.</span>
        </div>
      </div>

      {/* Automated Feature Engineering Accordion (Section 6) */}
      <div className="glass-card feature-engineering-card">
        <div className="feature-accordion-header" onClick={() => setShowFeatures(!showFeatures)}>
          <div className="feature-header-left">
            <Sparkles size={18} className="text-cyan" />
            <div>
              <h4 className="feature-heading">Automated Feature Engineering Details</h4>
              <p className="feature-subheading">View the 12 statistical parameters passed directly to the Random Forest model</p>
            </div>
          </div>
          <button className="btn-icon">
            {showFeatures ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {showFeatures && (
          <div className="features-content animate-fade-in">
            <p className="features-intro">
              The student does not manually enter complex statistics. The system automatically engineers these exact 12 features from your dynamic subject table:
            </p>
            <div className="features-grid-display">
              <div className="feature-metric">
                <span className="feature-name">july_overall_attendance</span>
                <span className="feature-val">{feature_summary.overallAttendance}%</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_total_conducted</span>
                <span className="feature-val">{feature_summary.totalConducted}</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_total_attended</span>
                <span className="feature-val">{feature_summary.totalAttended}</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_total_missed</span>
                <span className="feature-val">{feature_summary.totalMissed}</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_avg_subject_attendance</span>
                <span className="feature-val">{feature_summary.avgSubjectAttendance}%</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_min_subject_attendance</span>
                <span className="feature-val">{feature_summary.minSubjectAttendance}%</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_max_subject_attendance</span>
                <span className="feature-val">{feature_summary.maxSubjectAttendance}%</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_std_subject_attendance</span>
                <span className="feature-val">{feature_summary.stdSubjectAttendance}</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_subjects_below_75</span>
                <span className="feature-val">{feature_summary.subjectsBelow75}</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_subjects_below_65</span>
                <span className="feature-val">{feature_summary.subjectsBelow65}</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">july_subjects_count</span>
                <span className="feature-val">{feature_summary.subjectsCount}</span>
              </div>
              <div className="feature-metric">
                <span className="feature-name">cohort (Year-Sem)</span>
                <span className="feature-val">{feature_summary.cohort}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .student-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1.25rem;
          padding: 1.25rem 1.75rem;
          background: linear-gradient(135deg, rgba(19, 29, 49, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%);
        }
        .student-profile-group {
          display: flex;
          align-items: center;
          gap: 1.2rem;
        }
        .student-avatar {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #0284C7, #6366F1);
          color: #FFF;
          font-size: 1.4rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
        }
        .student-name-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .student-name-row h3 {
          font-size: 1.3rem;
          font-weight: 700;
        }
        .roll-pill {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 6px;
          padding: 0.15rem 0.5rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          font-family: var(--font-mono);
        }
        .student-tags-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }
        .student-subtag strong {
          color: var(--text-main);
        }
        .tag-separator {
          color: #334155;
        }
        .banner-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .kpi-card {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 1.35rem;
        }
        .highlight-card {
          border-color: rgba(56, 189, 248, 0.4);
          background: linear-gradient(180deg, rgba(19, 29, 49, 0.9) 0%, rgba(14, 30, 58, 0.6) 100%);
        }
        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .kpi-title {
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .kpi-chip {
          font-size: 0.7rem;
          color: var(--text-dim);
          background: rgba(255, 255, 255, 0.05);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
        }
        .kpi-value-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-top: 0.2rem;
        }
        .kpi-number {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: #1E293B;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.2rem;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 3px;
        }
        .bg-safe { background: #10B981; }
        .bg-risk { background: #F59E0B; }
        .bg-high-risk { background: #EF4444; }
        .kpi-delta {
          font-size: 0.8rem;
          color: var(--primary);
          font-weight: 600;
        }
        .kpi-disclaimer-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.72rem;
          color: #C084FC;
          background: rgba(168, 85, 247, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          border: 1px solid rgba(168, 85, 247, 0.25);
        }
        .risk-rule-explanation {
          font-size: 0.75rem;
          font-style: italic;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .safe-leave-text {
          font-size: 0.82rem;
          color: var(--text-main);
          line-height: 1.4;
        }
        .kpi-caption {
          font-size: 0.72rem;
          color: var(--text-dim);
          margin-top: auto;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 1.5rem;
        }
        .chart-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .chart-title {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .chart-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .chart-wrapper {
          width: 100%;
        }

        .subjects-section {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .subject-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .section-title-sm {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .section-subtitle-sm {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }
        .subject-breakdown-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.92rem;
        }
        .subject-breakdown-table th {
          text-align: left;
          padding: 0.75rem 0.6rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .subject-breakdown-table td {
          padding: 0.75rem 0.6rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.06);
        }
        .font-semibold { font-weight: 600; }
        .font-mono { font-family: var(--font-mono); }
        .subject-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.02);
          border: 1px dashed rgba(255, 255, 255, 0.08);
          padding: 0.6rem 0.9rem;
          border-radius: var(--radius-sm);
        }

        .feature-engineering-card {
          padding: 1.25rem 1.75rem;
        }
        .feature-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
        }
        .feature-header-left {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .feature-heading {
          font-size: 1.05rem;
          font-weight: 700;
        }
        .feature-subheading {
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .btn-icon {
          background: transparent;
          color: var(--text-muted);
          padding: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .features-content {
          margin-top: 1.25rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-card);
        }
        .features-intro {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1rem;
        }
        .features-grid-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 0.75rem;
        }
        .feature-metric {
          background: #0B1322;
          border: 1px solid #1E293B;
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }
        .feature-name {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: var(--text-dim);
        }
        .feature-val {
          font-family: var(--font-mono);
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary);
        }
      `}</style>
    </div>
  );
}
