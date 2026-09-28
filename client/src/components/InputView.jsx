import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  AlertCircle,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { predictAttendance } from '../services/api';
import { savePredictionToStorage } from '../utils/storage';

export default function InputView({ onPredictionComplete, initialData }) {
  const [student, setStudent] = useState({
    name: initialData?.student_info?.name || '',
    roll_number: initialData?.student_info?.roll_number || '',
    department: initialData?.student_info?.department || 'CSE',
    year: initialData?.student_info?.year || '3',
    semester: initialData?.student_info?.semester || '1',
    section: initialData?.student_info?.section || 'A',
  });

  const [subjects, setSubjects] = useState(
    initialData?.subject_breakdown?.map(s => ({
      name: s.name,
      conducted: s.conducted,
      attended: s.attended
    })) || [
      { name: 'DBMS', conducted: 10, attended: 8 },
      { name: 'Java', conducted: 12, attended: 9 },
      { name: 'OS', conducted: 10, attended: 7 },
      { name: 'Maths', conducted: 8, attended: 8 },
    ]
  );

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStudentChange = (field, value) => {
    setStudent(prev => ({ ...prev, [field]: value }));
  };

  const handleSubjectChange = (index, field, value) => {
    setSubjects(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });

    setErrorMessage('');
  };

  const addSubject = () => {
    setSubjects(prev => [
      ...prev,
      { name: '', conducted: 10, attended: 8 }
    ]);
  };

  const removeSubject = (index) => {
    if (subjects.length <= 1) {
      setErrorMessage('At least one subject is required.');
      return;
    }

    setSubjects(prev => prev.filter((_, i) => i !== index));
    setErrorMessage('');
  };

  const loadExample = () => {
    setSubjects([
      { name: 'DBMS', conducted: 10, attended: 8 },
      { name: 'Java', conducted: 12, attended: 9 },
      { name: 'OS', conducted: 10, attended: 7 },
      { name: 'Maths', conducted: 8, attended: 8 },
    ]);

    setStudent({
      name: 'Aditya Varma',
      roll_number: '21CS301',
      department: 'CSE',
      year: '3',
      semester: '1',
      section: 'A'
    });

    setErrorMessage('');
  };

  /* =====================================================
     LIVE CALCULATION
  ===================================================== */

  let totalConducted = 0;
  let totalAttended = 0;

  subjects.forEach(sub => {
    const c = Number(sub.conducted) || 0;
    const a = Number(sub.attended) || 0;

    totalConducted += c;
    totalAttended += a;
  });

  const overallPct =
    totalConducted > 0
      ? ((totalAttended / totalConducted) * 100).toFixed(1)
      : '0.0';

  const totalMissed = totalConducted - totalAttended;


  /* =====================================================
     VALIDATION
  ===================================================== */

  const validateForm = () => {
    if (!subjects || subjects.length === 0) {
      return 'At least one subject is required.';
    }

    for (let i = 0; i < subjects.length; i++) {
      const sub = subjects[i];
      const idx = i + 1;

      if (!sub.name || sub.name.trim() === '') {
        return `Subject #${idx}: Please enter a subject name.`;
      }

      const conducted = Number(sub.conducted);
      const attended = Number(sub.attended);

      if (isNaN(conducted) || isNaN(attended)) {
        return `Subject #${idx} ("${sub.name}"): Classes must be valid numbers.`;
      }

      if (conducted <= 0) {
        return `Subject #${idx} ("${sub.name}"): Classes conducted must be greater than 0.`;
      }

      if (attended < 0) {
        return `Subject #${idx} ("${sub.name}"): Classes attended cannot be negative.`;
      }

      if (attended > conducted) {
        return `Subject #${idx} ("${sub.name}"): Attended classes (${attended}) cannot exceed conducted classes (${conducted}).`;
      }
    }

    return null;
  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMessage('');

    const error = validateForm();

    if (error) {
      setErrorMessage(error);
      return;
    }

    setLoading(true);

    try {
      const formattedSubjects = subjects.map(s => ({
        name: s.name.trim(),
        conducted: Number(s.conducted),
        attended: Number(s.attended)
      }));

      const result = await predictAttendance(
        student,
        formattedSubjects
      );

      savePredictionToStorage(result);

      onPredictionComplete(
        result,
        student,
        formattedSubjects
      );

    } catch (err) {
      console.error('Prediction failed:', err);

      setErrorMessage(
        err.message ||
        'Prediction service is currently unavailable. Please try again.'
      );

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="input-view-container animate-fade-in">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="view-header">

        <div className="view-title-group">

          <div className="page-kicker">
            <span className="page-kicker-dot"></span>
            Attendance Prediction
          </div>

          <h2>
            Attendance Input
          </h2>

          <p className="view-subtitle">
            Enter your current subject-wise attendance to generate
            your prediction and risk analysis.
          </p>

        </div>


        <div className="header-actions">

          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={loadExample}
          >
            <RefreshCw size={14} />
            <span>Load Sample Data</span>
          </button>

        </div>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {errorMessage && (
        <div className="error-banner animate-fade-in">

          <div className="error-icon-wrapper">
            <AlertCircle size={19} />
          </div>

          <div className="error-text">
            {errorMessage}
          </div>

        </div>
      )}


      <form
        onSubmit={handleSubmit}
        className="input-form"
      >

        {/* =================================================
            SUBJECT ATTENDANCE
        ================================================= */}

        <div className="glass-card section-card">

          <div className="section-header-split">

            <div className="section-header">

              <div className="section-icon">
                <BookOpen size={18} />
              </div>

              <div>
                <h3>
                  Subject Attendance
                </h3>

                <p className="section-description">
                  Enter classes conducted and attended for each subject.
                </p>
              </div>

              <span className="badge badge-neutral">
                {subjects.length} Subjects
              </span>

            </div>


            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={addSubject}
            >
              <Plus size={16} />
              <span>Add Subject</span>
            </button>

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="table-responsive">

            <table className="subject-table">

              <thead>

                <tr>
                  <th style={{ width: '38%' }}>
                    Subject Name
                  </th>

                  <th style={{ width: '20%' }}>
                    Classes Conducted
                  </th>

                  <th style={{ width: '20%' }}>
                    Classes Attended
                  </th>

                  <th style={{ width: '15%' }}>
                    Current %
                  </th>

                  <th style={{ width: '50px' }}>
                    Action
                  </th>
                </tr>

              </thead>


              <tbody>

                {subjects.map((sub, idx) => {

                  const cond =
                    Number(sub.conducted) || 0;

                  const att =
                    Number(sub.attended) || 0;

                  const pct =
                    cond > 0
                      ? ((att / cond) * 100).toFixed(1)
                      : 0;

                  const isSafe = pct >= 75;

                  const isRisk =
                    pct >= 65 && pct < 75;

                  return (

                    <tr
                      key={idx}
                      className="subject-row"
                    >

                      {/* Subject */}

                      <td>

                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder={`Subject #${idx + 1}`}
                          value={sub.name}
                          onChange={(e) =>
                            handleSubjectChange(
                              idx,
                              'name',
                              e.target.value
                            )
                          }
                          required
                        />

                      </td>


                      {/* Conducted */}

                      <td>

                        <input
                          type="number"
                          min="1"
                          max="200"
                          className="form-input table-input text-center"
                          value={sub.conducted}
                          onChange={(e) =>
                            handleSubjectChange(
                              idx,
                              'conducted',
                              e.target.value
                            )
                          }
                          required
                        />

                      </td>


                      {/* Attended */}

                      <td>

                        <input
                          type="number"
                          min="0"
                          max={sub.conducted || 200}
                          className="form-input table-input text-center"
                          value={sub.attended}
                          onChange={(e) =>
                            handleSubjectChange(
                              idx,
                              'attended',
                              e.target.value
                            )
                          }
                          required
                        />

                      </td>


                      {/* Percentage */}

                      <td>

                        <span
                          className={`pct-indicator ${
                            isSafe
                              ? 'pct-safe'
                              : isRisk
                              ? 'pct-risk'
                              : 'pct-danger'
                          }`}
                        >
                          {pct}%
                        </span>

                      </td>


                      {/* Delete */}

                      <td className="text-center">

                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() =>
                            removeSubject(idx)
                          }
                          title="Remove subject"
                          disabled={subjects.length <= 1}
                        >
                          <Trash2 size={16} />
                        </button>

                      </td>

                    </tr>

                  );

                })}

              </tbody>

            </table>

          </div>


          {/* Bottom Add */}

          <div className="table-footer-actions">

            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={addSubject}
            >
              <Plus size={14} />
              <span>Add Another Subject</span>
            </button>

          </div>

        </div>


        {/* =================================================
            LIVE CALCULATION
        ================================================= */}

        <div className="live-preview-bar">

          <div className="preview-stat">

            <span className="stat-label">
              Total Conducted
            </span>

            <span className="stat-val">
              {totalConducted}
            </span>

          </div>


          <div className="preview-divider"></div>


          <div className="preview-stat">

            <span className="stat-label">
              Total Attended
            </span>

            <span className="stat-val text-emerald">
              {totalAttended}
            </span>

          </div>


          <div className="preview-divider"></div>


          <div className="preview-stat">

            <span className="stat-label">
              Total Missed
            </span>

            <span className="stat-val text-rose">
              {totalMissed}
            </span>

          </div>


          <div className="preview-divider"></div>


          <div className="preview-stat">

            <span className="stat-label">
              Current Overall
            </span>

            <span
              className={`stat-val-highlight ${
                Number(overallPct) >= 75
                  ? 'text-emerald'
                  : Number(overallPct) >= 65
                  ? 'text-amber'
                  : 'text-rose'
              }`}
            >
              {overallPct}%
            </span>

          </div>

        </div>


        {/* =================================================
            SUBMIT
        ================================================= */}

        <div className="form-submit-container">

          <button
            type="submit"
            className="btn-primary btn-submit-lg"
            disabled={loading}
          >

            {loading ? (
              <>
                <RefreshCw
                  size={19}
                  className="spin-icon"
                />

                <span>
                  Running Prediction...
                </span>
              </>
            ) : (
              <>
                <Sparkles size={19} />

                <span>
                  Predict Future Attendance
                </span>

                <span className="submit-arrow">
                  →
                </span>
              </>
            )}

          </button>

        </div>

      </form>


      {/* =================================================
          STYLES
      ================================================= */}

      <style>{`

        /* =========================================
           MAIN CONTAINER
        ========================================= */

        .input-view-container {
          width: 100%;

          max-width: 1320px;

          margin: 0 auto;

          padding:
            2rem 1.5rem 4rem;

          display: flex;

          flex-direction: column;

          gap: 1.5rem;
        }


        /* =========================================
           HEADER
        ========================================= */

        .view-header {
          display: flex;

          align-items: flex-end;

          justify-content: space-between;

          flex-wrap: wrap;

          gap: 1rem;
        }


        .view-title-group {
          display: flex;

          flex-direction: column;

          align-items: flex-start;
        }


        .page-kicker {
          display: inline-flex;

          align-items: center;

          gap: 0.45rem;

          margin-bottom: 0.35rem;

          color: #64748B;

          font-size: 0.72rem;

          font-weight: 700;

          text-transform: uppercase;

          letter-spacing: 0.08em;
        }


        .page-kicker-dot {
          width: 6px;

          height: 6px;

          border-radius: 50%;

          background: #10B981;
        }


        .view-title-group h2 {
          margin: 0;

          font-size: 1.85rem;

          font-weight: 800;

          color: #0F172A;
        }


        .view-subtitle {
          color: #64748B;

          font-size: 0.92rem;

          margin-top: 0.3rem;

          line-height: 1.6;
        }


        .header-actions {
          display: flex;

          align-items: center;
        }


        /* =========================================
           SMALL BUTTON
        ========================================= */

        .btn-sm {
          padding:
            0.5rem 0.85rem;

          font-size: 0.82rem;

          min-height: 36px;
        }


        /* =========================================
           ERROR
        ========================================= */

        .error-banner {
          display: flex;

          align-items: center;

          gap: 0.75rem;

          background: #FEF2F2;

          border:
            1px solid #FECACA;

          border-radius: var(--radius-md);

          padding:
            0.85rem 1.1rem;

          color: #B91C1C;

          box-shadow:
            0 3px 12px rgba(239, 68, 68, 0.05);
        }


        .error-icon-wrapper {
          width: 32px;

          height: 32px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 8px;

          background: #FEE2E2;

          color: #DC2626;
        }


        .error-text {
          font-size: 0.9rem;

          font-weight: 600;
        }


        /* =========================================
           FORM
        ========================================= */

        .input-form {
          display: flex;

          flex-direction: column;

          gap: 1.25rem;
        }


        /* =========================================
           CARD
        ========================================= */

        .section-card {
          display: flex;

          flex-direction: column;

          gap: 1.15rem;

          padding: 1.5rem;
        }


        /* =========================================
           SECTION HEADER
        ========================================= */

        .section-header {
          display: flex;

          align-items: center;

          gap: 0.65rem;

          min-width: 0;
        }


        .section-icon {
          width: 38px;

          height: 38px;

          flex-shrink: 0;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #DFF3FA,
              #F4FBFD
            );

          border:
            1px solid #C5E6EE;

          color: #0F172A;
        }


        .section-header h3 {
          margin: 0;

          font-size: 1.08rem;

          font-weight: 750;

          color: #0F172A;
        }


        .section-description {
          margin-top: 0.1rem;

          color: #94A3B8;

          font-size: 0.75rem;
        }


        .section-header-split {
          display: flex;

          align-items: center;

          justify-content: space-between;

          flex-wrap: wrap;

          gap: 1rem;
        }


        /* =========================================
           TABLE
        ========================================= */

        .table-responsive {
          width: 100%;

          overflow-x: auto;

          border:
            1px solid #E3E8EE;

          border-radius: 12px;

          background: #FFFFFF;
        }


        .subject-table {
          width: 100%;

          border-collapse: separate;

          border-spacing: 0;

          font-size: 0.9rem;
        }


        .subject-table th {
          text-align: left;

          padding:
            0.8rem 0.7rem;

          font-size: 0.73rem;

          font-weight: 700;

          color: #64748B;

          text-transform: uppercase;

          letter-spacing: 0.045em;

          background: #F8FAFC;

          border-bottom:
            1px solid #E3E8EE;

          white-space: nowrap;
        }


        .subject-table th:first-child {
          padding-left: 1rem;
        }


        .subject-table td {
          padding:
            0.7rem;

          border-bottom:
            1px solid #EEF2F6;

          background: #FFFFFF;
        }


        .subject-table tr:last-child td {
          border-bottom: none;
        }


        .subject-row {
          transition:
            background 0.15s ease;
        }


        .subject-row:hover td {
          background: #FBFDFF;
        }


        /* =========================================
           TABLE INPUT
        ========================================= */

        .table-input {
          padding:
            0.55rem 0.7rem;

          font-size: 0.88rem;

          box-shadow: none;
        }


        .table-input:focus {
          box-shadow:
            0 0 0 3px
            rgba(56, 189, 248, 0.12);
        }


        .text-center {
          text-align: center;
        }


        /* =========================================
           PERCENTAGE
        ========================================= */

        .pct-indicator {
          font-family: var(--font-mono);

          font-weight: 700;

          font-size: 0.82rem;

          padding:
            0.28rem 0.55rem;

          border-radius: 7px;

          display: inline-block;

          min-width: 54px;

          text-align: center;
        }


        .pct-safe {
          color: #047857;

          background: #ECFDF5;

          border:
            1px solid #A7F3D0;
        }


        .pct-risk {
          color: #B45309;

          background: #FFFBEB;

          border:
            1px solid #FDE68A;
        }


        .pct-danger {
          color: #DC2626;

          background: #FEF2F2;

          border:
            1px solid #FECACA;
        }


        /* =========================================
           DELETE BUTTON
        ========================================= */

        .btn-icon-danger {
          width: 34px;

          height: 34px;

          background: transparent;

          color: #94A3B8;

          padding: 0;

          border-radius: 8px;

          display: inline-flex;

          align-items: center;

          justify-content: center;
        }


        .btn-icon-danger:hover:not(:disabled) {
          color: #DC2626;

          background: #FEF2F2;
        }


        .btn-icon-danger:disabled {
          opacity: 0.3;

          cursor: not-allowed;
        }


        /* =========================================
           TABLE FOOTER
        ========================================= */

        .table-footer-actions {
          display: flex;

          justify-content: flex-start;

          padding-top: 0.15rem;
        }


        /* =========================================
           LIVE PREVIEW
        ========================================= */

        .live-preview-bar {
          width: 100%;

          display: flex;

          align-items: center;

          justify-content: space-around;

          padding:
            1.05rem 1.5rem;

          flex-wrap: wrap;

          gap: 1rem;

          background:
            linear-gradient(
              105deg,
              #FFFFFF 0%,
              #F3FAFC 52%,
              #FFF8F4 100%
            );

          border:
            1px solid #E3E8EE;

          border-radius: var(--radius-lg);

          box-shadow: var(--shadow-sm);
        }


        .preview-stat {
          display: flex;

          flex-direction: column;

          align-items: center;

          min-width: 120px;
        }


        .stat-label {
          font-size: 0.68rem;

          text-transform: uppercase;

          letter-spacing: 0.055em;

          color: #64748B;

          font-weight: 700;
        }


        .stat-val {
          font-family: var(--font-mono);

          font-size: 1.25rem;

          font-weight: 750;

          color: #0F172A;
        }


        .stat-val-highlight {
          font-family: var(--font-heading);

          font-size: 1.45rem;

          font-weight: 800;
        }


        .preview-divider {
          width: 1px;

          height: 32px;

          background: #E3E8EE;
        }


        /* =========================================
           STATUS COLORS
        ========================================= */

        .text-emerald {
          color: #059669;
        }


        .text-amber {
          color: #D97706;
        }


        .text-rose {
          color: #DC2626;
        }


        /* =========================================
           SUBMIT
        ========================================= */

        .form-submit-container {
          display: flex;

          justify-content: center;

          margin-top: 0.25rem;
        }


        .btn-submit-lg {
          min-height: 50px;

          padding:
            0.9rem 1.7rem;

          font-size: 0.95rem;

          border-radius: var(--radius-md);

          gap: 0.6rem;

          box-shadow:
            0 7px 20px
            rgba(15, 23, 42, 0.14);
        }


        .btn-submit-lg:hover:not(:disabled) {
          box-shadow:
            0 10px 26px
            rgba(15, 23, 42, 0.18);
        }


        .submit-arrow {
          font-size: 1.15rem;

          line-height: 1;

          transition:
            transform 0.2s ease;
        }


        .btn-submit-lg:hover .submit-arrow {
          transform:
            translateX(3px);
        }


        /* =========================================
           LOADING
        ========================================= */

        .spin-icon {
          animation:
            spin 1s linear infinite;
        }


        @keyframes spin {

          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }

        }


        /* =========================================
           MOBILE
        ========================================= */

        @media (max-width: 768px) {

          .input-view-container {
            padding:
              1.25rem 1rem 3rem;

            gap: 1.15rem;
          }


          .view-header {
            align-items: flex-start;
          }


          .view-title-group h2 {
            font-size: 1.55rem;
          }


          .section-card {
            padding: 1rem;
          }


          .section-header-split {
            align-items: flex-start;
          }


          .section-header {
            width: 100%;
          }


          .section-header-split > .btn-secondary {
            width: 100%;
          }


          .live-preview-bar {
            padding:
              1rem;

            gap: 0.8rem;
          }


          .preview-stat {
            min-width: 100px;
          }


          .preview-divider {
            display: none;
          }

        }


        @media (max-width: 520px) {

          .header-actions {
            width: 100%;
          }


          .header-actions button {
            width: 100%;
          }


          .section-description {
            display: none;
          }


          .subject-table {
            min-width: 680px;
          }


          .live-preview-bar {
            display: grid;

            grid-template-columns:
              repeat(2, 1fr);

            padding: 1rem;
          }


          .preview-stat {
            min-width: 0;
          }


          .btn-submit-lg {
            width: 100%;

            max-width: 360px;
          }

        }

      `}</style>

    </div>
  );
}