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

  /*
   * =====================================================
   * TRAJECTORY SOURCE
   * =====================================================
   *
   * Backend returns:
   *
   * trajectory: [
   *   {
   *     classes_missed,
   *     attendance_after_leave,
   *     predicted_future_attendance,
   *     risk_level
   *   }
   * ]
   */

  const trajectorySource = useMemo(() => {
    if (
      simulationData &&
      Array.isArray(simulationData.trajectory) &&
      simulationData.trajectory.length > 0
    ) {
      return simulationData.trajectory;
    }

    if (
      Array.isArray(currentPrediction?.leave_trajectory)
    ) {
      return currentPrediction.leave_trajectory;
    }

    return [];
  }, [
    simulationData,
    currentPrediction
  ]);

  /*
   * =====================================================
   * HANDLE SIMULATION
   * =====================================================
   */

  const handleSimulate = async (
    missCount = classesToMiss
  ) => {
    if (!subjects || subjects.length === 0) {
      setErrorMsg(
        'Please enter attendance details first.'
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const result = await simulateLeave(
        student || {},
        subjects || [],
        Number(missCount)
      );

      setSimulationData(result);

    } catch (error) {
      console.error(
        'Leave simulation error:',
        error
      );

      setErrorMsg(
        error?.message ||
        'Unable to simulate leave right now.'
      );

    } finally {
      setLoading(false);
    }
  };

  /*
   * =====================================================
   * GRAPH DATA
   * =====================================================
   *
   * IMPORTANT:
   * Graph uses predicted_future_attendance.
   *
   * The backend also gives attendance_after_leave,
   * but that is the immediate mathematical attendance
   * after adding missed classes.
   *
   * predicted_future_attendance is the ML forecast.
   */

  const trajectory = useMemo(() => {
    if (!Array.isArray(trajectorySource)) {
      return [];
    }

    return trajectorySource.map(
      (item, index) => ({
        classes: Number(
          item?.classes_missed ??
          item?.missed ??
          item?.classes ??
          index
        ),

        attendance: Number(
          item?.predicted_future_attendance ??
          item?.attendance_after_leave ??
          item?.attendance ??
          item?.percentage ??
          item?.overall_attendance ??
          0
        ),

        immediateAttendance: Number(
          item?.attendance_after_leave ??
          item?.predicted_future_attendance ??
          0
        ),

        risk: String(
          item?.risk_level ||
          'At Risk'
        )
      })
    );
  }, [trajectorySource]);

  /*
   * =====================================================
   * SELECTED SIMULATION RESULT
   * =====================================================
   *
   * If the user selected 3 classes, find the trajectory
   * point for 3 classes.
   *
   * If an actual /simulate-leave response exists for 3,
   * use that response because it is the most direct result.
   */

  const selectedPoint = useMemo(() => {
    return trajectory.find(
      item =>
        Number(item.classes) ===
        Number(classesToMiss)
    ) || null;
  }, [
    trajectory,
    classesToMiss
  ]);

  const simulationMatchesSelection =
    simulationData &&
    Number(simulationData.classes_missed) ===
      Number(classesToMiss);

  /*
   * =====================================================
   * CURRENT ATTENDANCE
   * =====================================================
   */

  const currentAttendance = Number(
    currentPrediction?.current_attendance ??
    currentPrediction?.feature_summary?.overallAttendance ??
    0
  );

  /*
   * =====================================================
   * AFTER LEAVE ATTENDANCE
   * =====================================================
   *
   * This uses attendance_after_leave.
   *
   * Example:
   *
   * Current = 80%
   * Miss 3 classes
   * After leave = mathematical attendance after those
   * 3 classes are added as missed.
   */

  const finalAttendance = Number(
    simulationMatchesSelection
      ? (
          simulationData?.attendance_after_leave ??
          simulationData?.predicted_future_attendance ??
          0
        )
      : (
          selectedPoint?.immediateAttendance ??
          selectedPoint?.attendance ??
          0
        )
  );

  /*
   * =====================================================
   * RISK
   * =====================================================
   */

  const risk = String(
    simulationMatchesSelection
      ? (
          simulationData?.risk_level ||
          'At Risk'
        )
      : (
          selectedPoint?.risk ||
          currentPrediction?.risk_level ||
          'At Risk'
        )
  );

  /*
   * =====================================================
   * MAXIMUM SAFE LEAVE
   * =====================================================
   */

  const safeLeave = Number(
    simulationData?.maximum_safe_leave ??
    currentPrediction?.maximum_safe_leave ??
    0
  );

  /*
   * =====================================================
   * GRAPH Y-AXIS
   * =====================================================
   *
   * Keep 65% and 75% visible.
   * If prediction goes below 65%, automatically
   * expand the graph downward.
   */

  const graphMin = useMemo(() => {
    if (trajectory.length === 0) {
      return 50;
    }

    const minimum = Math.min(
      ...trajectory.map(
        item => Number(item.attendance)
      )
    );

    if (!Number.isFinite(minimum)) {
      return 50;
    }

    return Math.min(
      65,
      Math.max(
        0,
        Math.floor(minimum / 5) * 5 - 5
      )
    );
  }, [trajectory]);

  /*
   * =====================================================
   * RISK CLASS
   * =====================================================
   */

  const getRiskClass = () => {
    const value =
      risk.toLowerCase();

    if (value.includes('high')) {
      return 'leave-risk-high';
    }

    if (value.includes('safe')) {
      return 'leave-risk-safe';
    }

    return 'leave-risk-warning';
  };

  /*
   * =====================================================
   * RISK ICON
   * =====================================================
   */

  const getRiskIcon = () => {
    const value =
      risk.toLowerCase();

    if (value.includes('high')) {
      return (
        <AlertOctagon size={18} />
      );
    }

    if (value.includes('safe')) {
      return (
        <ShieldCheck size={18} />
      );
    }

    return (
      <AlertTriangle size={18} />
    );
  };

  /*
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="leave-page animate-fade-in">

      {/* =================================================
          HEADER
      ================================================= */}

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
              See how missing classes could affect
              your attendance.
            </p>
          </div>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {errorMsg && (
        <div className="leave-error">

          <AlertTriangle size={18} />

          {errorMsg}

        </div>
      )}


      {/* =================================================
          CONTROLS
      ================================================= */}

      <section className="leave-control-card">

        <div>

          <span className="leave-section-label">
            Classes you plan to miss
          </span>

          <div className="leave-number-row">

            <input
              type="number"
              min="0"
              max="20"
              value={classesToMiss}
              onChange={(e) => {
                const value =
                  Math.max(
                    0,
                    Math.min(
                      20,
                      Number(e.target.value) || 0
                    )
                  );

                setClassesToMiss(value);
              }}
            />

            <span>
              classes
            </span>

          </div>

        </div>


        <div className="leave-slider-wrap">

          <input
            type="range"
            min="0"
            max="20"
            value={classesToMiss}
            onChange={(e) =>
              setClassesToMiss(
                Number(e.target.value)
              )
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
          onClick={() =>
            handleSimulate()
          }
          disabled={loading}
        >

          <Play size={17} />

          {loading
            ? 'Simulating...'
            : 'Simulate Leave'}

        </button>

      </section>


      {/* =================================================
          MAX SAFE LEAVE
      ================================================= */}

      <section className="leave-safe-card">

        <div className="leave-safe-icon">
          <ShieldCheck size={23} />
        </div>

        <div>

          <span>
            Maximum Safe Leave
          </span>

          <strong>
            {safeLeave} classes
          </strong>

          <p>
            {simulationData?.max_safe_leave_message ||
              currentPrediction?.max_safe_leave_message ||
              'Based on the current attendance prediction.'}
          </p>

        </div>

      </section>


      {/* =================================================
          OUTCOME CARDS
      ================================================= */}

      {(trajectory.length > 0 ||
        simulationData) && (

        <div className="leave-outcomes">

          {/* CURRENT */}

          <div className="leave-outcome-card">

            <span>
              Current Attendance
            </span>

            <strong>
              {currentAttendance.toFixed(2)}%
            </strong>

          </div>


          {/* AFTER LEAVE */}

          <div className="leave-outcome-card leave-outcome-highlight">

            <span>
              After {classesToMiss} Classes
            </span>

            <strong>
              {finalAttendance.toFixed(2)}%
            </strong>

          </div>


          {/* CHANGE */}

          <div className="leave-outcome-card">

            <span>
              Change
            </span>

            <strong
              className={
                finalAttendance <
                currentAttendance
                  ? 'change-negative'
                  : 'change-positive'
              }
            >
              {(
                finalAttendance -
                currentAttendance
              ).toFixed(2)}
              %
            </strong>

          </div>


          {/* RISK */}

          <div className="leave-outcome-card">

            <span>
              Risk
            </span>

            <strong
              className={`leave-risk-text ${getRiskClass()}`}
            >

              {getRiskIcon()}

              {risk}

            </strong>

          </div>

        </div>
      )}


      {/* =================================================
          GRAPH
      ================================================= */}

      {trajectory.length > 0 && (

        <section className="leave-chart-card">

          <div className="leave-chart-header">

            <div>

              <h2>
                Leave Impact
              </h2>

              <p>
                ML-predicted future attendance as
                missed classes increase.
              </p>

            </div>

            {finalAttendance <
            currentAttendance ? (

              <TrendingDown
                className="leave-chart-down"
              />

            ) : (

              <TrendingUp
                className="leave-chart-up"
              />

            )}

          </div>


          <div className="leave-chart">

            <ResponsiveContainer
              width="100%"
              height={330}
            >

              <LineChart
                data={trajectory}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 10
                }}
              >

                <CartesianGrid
                  stroke="#E3E8EE"
                  strokeDasharray="4 4"
                />


                <XAxis
                  dataKey="classes"
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                  axisLine={{
                    stroke: '#E3E8EE'
                  }}
                  tickLine={false}
                  label={{
                    value: 'Classes Missed',
                    position: 'insideBottom',
                    offset: -5,
                    fill: '#64748B',
                    fontSize: 12
                  }}
                />


                <YAxis
                  domain={[
                    graphMin,
                    100
                  ]}
                  tick={{
                    fill: '#64748B',
                    fontSize: 12
                  }}
                  axisLine={{
                    stroke: '#E3E8EE'
                  }}
                  tickLine={false}
                  tickFormatter={(value) =>
                    `${value}%`
                  }
                />


                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E3E8EE',
                    borderRadius: '10px',
                    boxShadow:
                      '0 8px 25px rgba(15,23,42,.10)'
                  }}

                  labelStyle={{
                    color: '#0F172A',
                    fontWeight: 700
                  }}

                  formatter={(value) => [
                    `${Number(value).toFixed(2)}%`,
                    'Predicted Future Attendance'
                  ]}

                  labelFormatter={(label) =>
                    `${label} classes missed`
                  }
                />


                <ReferenceLine
                  y={75}
                  stroke="#10B981"
                  strokeDasharray="6 4"
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
                  strokeDasharray="6 4"
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
                    fill: '#DFF3FA',
                    stroke: '#0F172A',
                    strokeWidth: 2,
                    r: 4
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

        </section>
      )}


      {/* =================================================
          NO GRAPH DATA
      ================================================= */}

      {trajectory.length === 0 && (
        <section className="leave-no-data">

          <TrendingDown size={22} />

          <div>

            <strong>
              No leave trajectory available yet
            </strong>

            <p>
              Click "Simulate Leave" to calculate
              the attendance impact.
            </p>

          </div>

        </section>
      )}


      {/* =================================================
          NOTE
      ================================================= */}

      <div className="leave-disclaimer">

        <strong>
          Note:
        </strong>{' '}

        This simulator provides an estimate based on
        your current attendance data. Actual attendance
        may vary depending on future class schedules.

      </div>


      {/* =================================================
          STYLES
      ================================================= */}

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
        .leave-outcome-card,
        .leave-no-data {
          background: #fff;
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow:
            0 8px 25px rgba(15,23,42,.045);
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

        .change-negative {
          color: #DC2626 !important;
        }

        .change-positive {
          color: #059669 !important;
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

        .leave-no-data {
          margin-top: 1rem;
          padding: 1.2rem;
          display: flex;
          align-items: center;
          gap: .8rem;
          color: var(--text-muted);
        }

        .leave-no-data svg {
          color: var(--primary);
          flex-shrink: 0;
        }

        .leave-no-data strong {
          display: block;
          color: var(--text-main);
          margin-bottom: .2rem;
        }

        .leave-no-data p {
          margin: 0;
          font-size: .8rem;
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