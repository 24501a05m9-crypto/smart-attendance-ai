import React, { useState } from 'react';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  Edit3,
  Info,
  ChevronDown,
  ChevronUp,
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

export default function DashboardView({
  predictionData,
  onEditAttendance,
  onOpenLeaveSimulator
}) {
  const [showFeatures, setShowFeatures] = useState(false);

  if (!predictionData) {
    return (
      <div className="dashboard-empty glass-card">
        <div className="empty-icon">
          <TrendingUp size={22} />
        </div>

        <h3>No Prediction Data Found</h3>

        <p>
          Please enter your subject attendance data to generate forecasts.
        </p>

        <button
          className="btn-primary"
          onClick={onEditAttendance}
        >
          Go to Attendance Input
        </button>
      </div>
    );
  }

  const {
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

  /* =====================================================
     FORECAST CHART
  ===================================================== */

  const forecastChartData = [
    {
      name: 'Current',
      attendance: Number(current_attendance),
      type: 'Recorded Baseline'
    },
    {
      name: 'ML Prediction',
      attendance: Number(september_prediction),
      type: 'Random Forest Model'
    },
    {
      name: 'Future Projection',
      attendance: Number(october_forecast),
      type: 'Future Projection'
    }
  ];

  /* =====================================================
     LEAVE IMPACT CHART
  ===================================================== */

  const leaveChartData = (
    leave_trajectory.length > 0
      ? leave_trajectory
      : [
          {
            classes_missed: 0,
            predicted_future_attendance: september_prediction
          },
          {
            classes_missed: 1,
            predicted_future_attendance: september_prediction - 1.2
          },
          {
            classes_missed: 2,
            predicted_future_attendance: september_prediction - 2.5
          },
          {
            classes_missed: 3,
            predicted_future_attendance: september_prediction - 3.8
          },
          {
            classes_missed: 4,
            predicted_future_attendance: september_prediction - 5.1
          },
          {
            classes_missed: 5,
            predicted_future_attendance: september_prediction - 6.5
          }
        ]
  ).map((pt) => ({
    classes_missed: `${pt.classes_missed} Missed`,
    classesCount: pt.classes_missed,
    predicted: Number(pt.predicted_future_attendance),
    immediate: Number(
      pt.attendance_after_leave ||
      pt.predicted_future_attendance
    )
  }));

  /* =====================================================
     RISK BADGE
  ===================================================== */

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'Safe':
        return (
          <span className="badge badge-safe">
            <ShieldCheck size={14} />
            <span>Safe ≥ 75%</span>
          </span>
        );

      case 'At Risk':
        return (
          <span className="badge badge-risk">
            <AlertTriangle size={14} />
            <span>At Risk 65–74%</span>
          </span>
        );

      default:
        return (
          <span className="badge badge-high-risk">
            <AlertOctagon size={14} />
            <span>High Risk &lt; 65%</span>
          </span>
        );
    }
  };

  return (
    <div className="dashboard-container animate-fade-in">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="dashboard-header">

        <div>

          <div className="dashboard-kicker">
            <span className="dashboard-kicker-dot"></span>
            Prediction Dashboard
          </div>

          <h2 className="dashboard-title">
            Attendance Prediction
          </h2>

          <p className="dashboard-subtitle">
            Current attendance, ML prediction and leave analysis
          </p>

        </div>

        <div className="dashboard-actions">

          <button
            className="btn-secondary btn-sm"
            onClick={onEditAttendance}
          >
            <Edit3 size={14} />
            <span>Edit Attendance</span>
          </button>

          <button
            className="btn-primary btn-sm"
            onClick={onOpenLeaveSimulator}
          >
            <SlidersHorizontal size={14} />
            <span>Leave Simulator</span>
          </button>

        </div>

      </div>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="kpi-grid">

        {/* CURRENT */}

        <div className="glass-card kpi-card">

          <div className="kpi-header">

            <span className="kpi-title">
              Current Attendance
            </span>

            <span className="kpi-chip">
              Recorded
            </span>

          </div>

          <div className="kpi-value-row">

            <span className="kpi-number">
              {Number(current_attendance).toFixed(1)}%
            </span>

          </div>

          <div className="progress-bar-track">

            <div
              className={`progress-bar-fill ${
                current_attendance >= 75
                  ? 'bg-safe'
                  : current_attendance >= 65
                    ? 'bg-risk'
                    : 'bg-high-risk'
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(0, current_attendance)
                )}%`
              }}
            />

          </div>

          <span className="kpi-caption">
            {feature_summary.totalAttended || 0} /{' '}
            {feature_summary.totalConducted || 0} classes attended
          </span>

        </div>

        {/* ML PREDICTION */}

        <div className="glass-card kpi-card september-card">

          <div className="kpi-header">

            <span className="kpi-title">
              ML Predicted Attendance
            </span>

            <span className="forecast-chip">
              ML Prediction
            </span>

          </div>

          <div className="kpi-value-row">

            <span className="kpi-number text-blue">
              {Number(september_prediction).toFixed(1)}%
            </span>

            <div className="forecast-icon blue-icon">
              <TrendingUp size={19} />
            </div>

          </div>

          <div className="kpi-delta">

            <span
              className={
                september_prediction >= current_attendance
                  ? 'delta-positive'
                  : 'delta-negative'
              }
            >
              {september_prediction >= current_attendance
                ? '▲ +'
                : '▼ '}
              {Math.abs(
                september_prediction - current_attendance
              ).toFixed(1)}
              % vs Current
            </span>

          </div>

          <span className="kpi-caption">
            Trained Random Forest Model (300 estimators)
          </span>

        </div>

        {/* FUTURE PROJECTION */}

        <div className="glass-card kpi-card october-card">

          <div className="kpi-header">

            <span className="kpi-title">
              Future Attendance Projection
            </span>

            <span className="kpi-chip">
              Projection
            </span>

          </div>

          <div className="kpi-value-row">

            <span className="kpi-number text-peach">
              {Number(october_forecast).toFixed(1)}%
            </span>

          </div>

          <div className="kpi-disclaimer-pill">

            <Info size={12} />

            <span>
              Exploratory projection
            </span>

          </div>

          <span className="kpi-caption">
            Not trained/validated on actual future targets
          </span>

        </div>

        {/* RISK */}

        <div className="glass-card kpi-card">

          <div className="kpi-header">

            <span className="kpi-title">
              Risk Level
            </span>

            <span className="kpi-chip">
              Rule-Based
            </span>

          </div>

          <div className="kpi-value-row">
            {getRiskBadge(risk_level)}
          </div>

          <div className="risk-rule-explanation">
            Risk level is determined using attendance
            thresholds after the ML prediction.
          </div>

          <span className="kpi-caption">
            Safe ≥ 75% | At Risk 65–74% | High Risk &lt; 65%
          </span>

        </div>

        {/* MAX SAFE LEAVE */}

        <div className="glass-card kpi-card safe-leave-card">

          <div className="kpi-header">

            <span className="kpi-title">
              Maximum Safe Leave
            </span>

            <span className="kpi-chip">
              Forecast
            </span>

          </div>

          <div className="kpi-value-row">

            <span className="kpi-number text-emerald">

              {maximum_safe_leave}

              <span className="classes-label">
                Classes
              </span>

            </span>

          </div>

          <p className="safe-leave-text">
            {max_safe_leave_message ||
              `You can safely miss up to ${maximum_safe_leave} classes based on the current forecast.`}
          </p>

          <span className="kpi-caption">
            Based on the model forecast maintaining ≥ 75%.
          </span>

        </div>

      </div>

      {/* =====================================================
          CHARTS
      ===================================================== */}

      <div className="charts-grid">

        {/* ATTENDANCE FORECAST */}

        <div className="glass-card chart-card">

          <div className="chart-header">

            <div>

              <h3 className="chart-title">
                Attendance Horizon Progression
              </h3>

              <p className="chart-desc">
                Current attendance vs ML prediction and future projection
              </p>

            </div>

          </div>

          <div className="chart-wrapper">

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <LineChart
                data={forecastChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 10
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E3E8EE"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  stroke="#94A3B8"
                  tick={{
                    fill: '#64748B',
                    fontSize: 11
                  }}
                />

                <YAxis
                  domain={[50, 100]}
                  stroke="#94A3B8"
                  tick={{
                    fill: '#64748B',
                    fontSize: 11
                  }}
                  unit="%"
                />

                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E3E8EE',
                    borderRadius: '10px',
                    boxShadow:
                      '0 8px 25px rgba(15, 23, 42, 0.10)'
                  }}
                  labelStyle={{
                    color: '#0F172A',
                    fontWeight: 700
                  }}
                  itemStyle={{
                    color: '#334155'
                  }}
                  formatter={(val, name, item) => [
                    `${val}%`,
                    item.payload.type
                  ]}
                />

                <ReferenceLine
                  y={75}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  label={{
                    value: '75% Safe',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopRight'
                  }}
                />

                <ReferenceLine
                  y={65}
                  stroke="#EF4444"
                  strokeDasharray="4 4"
                  label={{
                    value: '65% Critical',
                    fill: '#DC2626',
                    fontSize: 10,
                    position: 'insideBottomRight'
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#0F172A"
                  strokeWidth={3}
                  dot={{
                    r: 5,
                    fill: '#0F172A',
                    stroke: '#FFFFFF',
                    strokeWidth: 2
                  }}
                  activeDot={{
                    r: 7,
                    fill: '#0F172A',
                    stroke: '#FFFFFF',
                    strokeWidth: 2
                  }}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* LEAVE IMPACT */}

        <div className="glass-card chart-card">

          <div className="chart-header">

            <div>

              <h3 className="chart-title">
                Leave Impact Curve
              </h3>

              <p className="chart-desc">
                Predicted future attendance as classes missed increases
              </p>

            </div>

            <button
              className="btn-secondary btn-sm"
              onClick={onOpenLeaveSimulator}
            >
              <span>Open Simulator</span>
              <ArrowRight size={14} />
            </button>

          </div>

          <div className="chart-wrapper">

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <AreaChart
                data={leaveChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 10
                }}
              >

                <defs>

                  <linearGradient
                    id="leaveImpactGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#38BDF8"
                      stopOpacity={0.28}
                    />

                    <stop
                      offset="95%"
                      stopColor="#FBEDE6"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E3E8EE"
                  vertical={false}
                />

                <XAxis
                  dataKey="classes_missed"
                  stroke="#94A3B8"
                  tick={{
                    fill: '#64748B',
                    fontSize: 10
                  }}
                />

                <YAxis
                  domain={[50, 100]}
                  stroke="#94A3B8"
                  tick={{
                    fill: '#64748B',
                    fontSize: 11
                  }}
                  unit="%"
                />

                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E3E8EE',
                    borderRadius: '10px',
                    boxShadow:
                      '0 8px 25px rgba(15, 23, 42, 0.10)'
                  }}
                  labelStyle={{
                    color: '#0F172A',
                    fontWeight: 700
                  }}
                  itemStyle={{
                    color: '#334155'
                  }}
                  formatter={(val) => [
                    `${val}%`,
                    'Predicted Future Attendance'
                  ]}
                />

                <ReferenceLine
                  y={75}
                  stroke="#10B981"
                  strokeDasharray="4 4"
                  label={{
                    value: '75% Cutoff',
                    fill: '#059669',
                    fontSize: 10
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="predicted"
                  stroke="#0EA5E9"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#leaveImpactGrad)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

      {/* =====================================================
          SUBJECT BREAKDOWN
      ===================================================== */}

      <div className="glass-card subjects-section">

        <div className="subject-section-header">

          <div>

            <h3 className="section-title-sm">
              Subject-Level Risk Breakdown
            </h3>

            <p className="section-subtitle-sm">

              Supporting rule-based analysis:{' '}

              <strong className="text-emerald">
                ≥ 75% Safe
              </strong>

              ,{' '}

              <strong className="text-amber">
                65–74% At Risk
              </strong>

              ,{' '}

              <strong className="text-rose">
                &lt; 65% High Risk
              </strong>.

            </p>

          </div>

          <span className="badge badge-neutral">
            Rule-Based Analysis
          </span>

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

                  <td className="font-semibold">
                    {sub.name}
                  </td>

                  <td>
                    {sub.conducted}
                  </td>

                  <td>
                    {sub.attended}
                  </td>

                  <td className="text-rose">
                    {sub.missed}
                  </td>

                  <td className="font-mono">
                    {sub.percentage}%
                  </td>

                  <td>

                    {sub.status === 'Safe' ? (

                      <span className="badge badge-safe">
                        <ShieldCheck size={13} />
                        Safe
                      </span>

                    ) : sub.status === 'At Risk' ? (

                      <span className="badge badge-risk">
                        <AlertTriangle size={13} />
                        At Risk
                      </span>

                    ) : (

                      <span className="badge badge-high-risk">
                        <AlertOctagon size={13} />
                        High Risk
                      </span>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        <div className="subject-note">

          <Info
            size={14}
            className="note-icon"
          />

          <span>
            Subject-level status is a supporting rule-based
            feature for classroom guidance. It is distinct
            from the overall ML prediction model.
          </span>

        </div>

      </div>

      {/* =====================================================
          FEATURE ENGINEERING
      ===================================================== */}

      <div className="glass-card feature-engineering-card">

        <div
          className="feature-accordion-header"
          onClick={() =>
            setShowFeatures(!showFeatures)
          }
        >

          <div className="feature-header-left">

            <div className="feature-icon">
              <Sparkles size={17} />
            </div>

            <div>

              <h4 className="feature-heading">
                Automated Feature Engineering Details
              </h4>

              <p className="feature-subheading">
                View the 11 statistical parameters
                passed to the Random Forest model
              </p>

            </div>

          </div>

          <button
            type="button"
            className="btn-icon"
            aria-label={
              showFeatures
                ? 'Collapse features'
                : 'Expand features'
            }
          >

            {showFeatures ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}

          </button>

        </div>

        {showFeatures && (

          <div className="features-content animate-fade-in">

            <p className="features-intro">
              The student does not manually enter complex
              statistics. The system automatically engineers
              these parameters from the dynamic subject table.
            </p>

            <div className="features-grid-display">

              <div className="feature-metric">
                <span className="feature-name">
                  Current Overall Attendance
                </span>

                <span className="feature-val">
                  {feature_summary.overallAttendance}%
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Current Total Classes Conducted
                </span>

                <span className="feature-val">
                  {feature_summary.totalConducted}
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Current Total Classes Attended
                </span>

                <span className="feature-val">
                  {feature_summary.totalAttended}
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Current Total Classes Missed
                </span>

                <span className="feature-val">
                  {feature_summary.totalMissed}
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Average Subject Attendance
                </span>

                <span className="feature-val">
                  {feature_summary.avgSubjectAttendance}%
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Minimum Subject Attendance
                </span>

                <span className="feature-val">
                  {feature_summary.minSubjectAttendance}%
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Maximum Subject Attendance
                </span>

                <span className="feature-val">
                  {feature_summary.maxSubjectAttendance}%
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Subject Attendance Standard Deviation
                </span>

                <span className="feature-val">
                  {feature_summary.stdSubjectAttendance}
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Subjects Below 75%
                </span>

                <span className="feature-val">
                  {feature_summary.subjectsBelow75}
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Subjects Below 65%
                </span>

                <span className="feature-val">
                  {feature_summary.subjectsBelow65}
                </span>
              </div>

              <div className="feature-metric">
                <span className="feature-name">
                  Total Subjects
                </span>

                <span className="feature-val">
                  {feature_summary.subjectsCount}
                </span>
              </div>

            </div>

          </div>

        )}

      </div>

      {/* =====================================================
          STYLES
      ===================================================== */}

      <style>{`

        /* =========================================
           DASHBOARD
        ========================================= */

        .dashboard-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 1.5rem 1.25rem 3rem;
        }

        /* =========================================
           EMPTY STATE
        ========================================= */

        .dashboard-empty {
          max-width: 650px;
          margin: 3rem auto;
          padding: 2.5rem;
          text-align: center;
        }

        .dashboard-empty h3 {
          margin-top: 0.85rem;
          color: #0F172A;
        }

        .dashboard-empty p {
          margin: 0.5rem 0 0;
          color: #64748B;
        }

        .dashboard-empty .btn-primary {
          margin-top: 1.25rem;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #DFF3FA;
          color: #0F172A;
        }

        /* =========================================
           HEADER
        ========================================= */

        .dashboard-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 1rem;
        }

        .dashboard-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-bottom: 0.25rem;
          color: #64748B;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .dashboard-kicker-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10B981;
        }

        .dashboard-title {
          margin: 0;
          color: #0F172A;
          font-size: 1.55rem;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        .dashboard-subtitle {
          margin: 0.3rem 0 0;
          color: #64748B;
          font-size: 0.82rem;
        }

        .dashboard-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }

        /* =========================================
           KPI GRID
        ========================================= */

        .kpi-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 0.9rem;
        }

        .kpi-card {
          min-width: 0;
          min-height: 174px;
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          padding: 1.1rem;
          background: #FFFFFF;
        }

        .september-card {
          background:
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #F1FAFD 100%
            );
          border-color: #CBEAF2;
        }

        .october-card {
          background:
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #FFF7F3 100%
            );
          border-color: #F2DED4;
        }

        .safe-leave-card {
          background:
            linear-gradient(
              145deg,
              #FFFFFF 0%,
              #F2FBF7 100%
            );
          border-color: #D1EEE0;
        }

        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .kpi-title {
          font-size: 0.73rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: #64748B;
        }

        .kpi-chip {
          flex-shrink: 0;
          font-size: 0.64rem;
          font-weight: 600;
          color: #64748B;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          padding: 0.2rem 0.42rem;
          border-radius: 6px;
        }

        .forecast-chip {
          flex-shrink: 0;
          font-size: 0.64rem;
          font-weight: 700;
          color: #0369A1;
          background: #EAF8FC;
          border: 1px solid #BAE6F3;
          padding: 0.2rem 0.42rem;
          border-radius: 6px;
        }

        .kpi-value-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
          margin-top: 0.2rem;
        }

        .kpi-number {
          font-family: var(--font-heading);
          font-size: 1.85rem;
          font-weight: 800;
          line-height: 1.1;
          color: #0F172A;
        }

        .text-blue {
          color: #0284C7;
        }

        .text-peach {
          color: #C2410C;
        }

        .text-emerald {
          color: #059669;
        }

        .text-amber {
          color: #D97706;
        }

        .text-rose {
          color: #DC2626;
        }

        .classes-label {
          margin-left: 0.2rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748B;
        }

        .forecast-icon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
        }

        .blue-icon {
          color: #0284C7;
          background: #EAF8FC;
          border: 1px solid #BAE6F3;
        }

        /* =========================================
           PROGRESS
        ========================================= */

        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: #E8EDF2;
          border-radius: 5px;
          overflow: hidden;
          margin-top: 0.25rem;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 5px;
        }

        .bg-safe {
          background: #10B981;
        }

        .bg-risk {
          background: #F59E0B;
        }

        .bg-high-risk {
          background: #EF4444;
        }

        .kpi-delta {
          font-size: 0.75rem;
          font-weight: 700;
        }

        .delta-positive {
          color: #059669;
        }

        .delta-negative {
          color: #DC2626;
        }

        .kpi-disclaimer-pill {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          gap: 0.35rem;
          font-size: 0.65rem;
          font-weight: 600;
          color: #9A3412;
          background: #FFF1EB;
          padding: 0.22rem 0.48rem;
          border-radius: 6px;
          border: 1px solid #F5D5C7;
        }

        .risk-rule-explanation {
          font-size: 0.71rem;
          color: #64748B;
          line-height: 1.4;
        }

        .safe-leave-text {
          margin: 0;
          font-size: 0.76rem;
          color: #334155;
          line-height: 1.4;
        }

        .kpi-caption {
          font-size: 0.66rem;
          color: #94A3B8;
          margin-top: auto;
          line-height: 1.35;
        }

        /* =========================================
           CHARTS
        ========================================= */

        .charts-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 1.1rem;
        }

        .chart-card {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
          padding: 1.2rem;
          background: #FFFFFF;
        }

        .chart-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.7rem;
        }

        .chart-title {
          margin: 0;
          color: #0F172A;
          font-size: 1rem;
          font-weight: 750;
        }

        .chart-desc {
          margin: 0.25rem 0 0;
          font-size: 0.76rem;
          color: #64748B;
          line-height: 1.4;
        }

        .chart-wrapper {
          width: 100%;
          min-width: 0;
        }

        /* =========================================
           SUBJECTS
        ========================================= */

        .subjects-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1.2rem;
          background: #FFFFFF;
        }

        .subject-section-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .section-title-sm {
          margin: 0;
          color: #0F172A;
          font-size: 1rem;
          font-weight: 750;
        }

        .section-subtitle-sm {
          margin: 0.25rem 0 0;
          font-size: 0.76rem;
          color: #64748B;
        }

        .subject-breakdown-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.84rem;
        }

        .subject-breakdown-table th {
          text-align: left;
          padding: 0.7rem 0.55rem;
          font-size: 0.7rem;
          color: #64748B;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          background: #F8FAFC;
          border-bottom: 1px solid #E3E8EE;
        }

        .subject-breakdown-table td {
          padding: 0.7rem 0.55rem;
          color: #334155;
          border-bottom: 1px solid #EEF2F6;
        }

        .subject-breakdown-table tbody tr:hover td {
          background: #FBFDFF;
        }

        .font-semibold {
          font-weight: 650;
          color: #0F172A !important;
        }

        .font-mono {
          font-family: var(--font-mono);
        }

        .subject-note {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.73rem;
          color: #64748B;
          background: #F8FAFC;
          border: 1px dashed #CBD5E1;
          padding: 0.65rem 0.8rem;
          border-radius: 8px;
          line-height: 1.45;
        }

        .note-icon {
          color: #0284C7;
          flex-shrink: 0;
          margin-top: 1px;
        }

        /* =========================================
           FEATURE ENGINEERING
        ========================================= */

        .feature-engineering-card {
          padding: 1rem 1.2rem;
          background: #FFFFFF;
        }

        .feature-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          gap: 1rem;
        }

        .feature-header-left {
          display: flex;
          align-items: center;
          gap: 0.7rem;
          min-width: 0;
        }

        .feature-icon {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #EAF8FC;
          border: 1px solid #BAE6F3;
          color: #0284C7;
        }

        .feature-heading {
          margin: 0;
          color: #0F172A;
          font-size: 0.92rem;
          font-weight: 700;
        }

        .feature-subheading {
          margin: 0.2rem 0 0;
          font-size: 0.72rem;
          color: #64748B;
        }

        .btn-icon {
          flex-shrink: 0;
          background: #FFFFFF;
          color: #64748B;
          padding: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #E3E8EE;
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-icon:hover {
          color: #0F172A;
          background: #EAF8FC;
          border-color: #BAE6F3;
        }

        .features-content {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #E3E8EE;
        }

        .features-intro {
          margin: 0 0 0.9rem;
          font-size: 0.76rem;
          color: #64748B;
          line-height: 1.5;
        }

        .features-grid-display {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 0.65rem;
        }

        .feature-metric {
          background:
            linear-gradient(
              145deg,
              #F8FAFC,
              #F3FAFC
            );

          border: 1px solid #E3E8EE;

          border-radius: 8px;

          padding:
            0.6rem 0.7rem;

          display: flex;

          flex-direction: column;

          gap: 0.15rem;

          min-width: 0;
        }

        .feature-name {
          font-family: var(--font-mono);
          font-size: 0.64rem;
          color: #64748B;
          overflow-wrap: anywhere;
        }

        .feature-val {
          font-family: var(--font-mono);
          font-size: 0.9rem;
          font-weight: 750;
          color: #0F172A;
        }

        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 1250px) {

          .kpi-grid {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

          .features-grid-display {
            grid-template-columns:
              repeat(3, minmax(0, 1fr));
          }

        }

        @media (max-width: 900px) {

          .dashboard-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .dashboard-actions {
            width: 100%;
          }

          .dashboard-actions button {
            flex: 1;
            justify-content: center;
          }

          .kpi-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .charts-grid {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 600px) {

          .dashboard-container {
            padding:
              1.15rem 1rem 3rem;

            gap: 1rem;
          }

          .dashboard-title {
            font-size: 1.3rem;
          }

          .dashboard-subtitle {
            font-size: 0.75rem;
          }

          .dashboard-actions {
            flex-direction: column;
          }

          .dashboard-actions button {
            width: 100%;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .kpi-card {
            min-height: 155px;
          }

          .chart-card {
            padding:
              1rem 0.75rem;
          }

          .charts-grid {
            gap: 1rem;
          }

          .subjects-section {
            padding:
              1rem 0.75rem;
          }

          .subject-breakdown-table {
            min-width: 620px;
          }

          .features-grid-display {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .feature-engineering-card {
            padding: 0.9rem;
          }

        }

      `}</style>

    </div>
  );
}