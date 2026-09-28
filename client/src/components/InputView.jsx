import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  BookOpen, 
  User, 
  Building2, 
  Calendar, 
  Hash, 
  CheckCircle2 
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

  // Handle student info change
  const handleStudentChange = (field, value) => {
    setStudent(prev => ({ ...prev, [field]: value }));
  };

  // Handle subject row change
  const handleSubjectChange = (index, field, value) => {
    setSubjects(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
    setErrorMessage('');
  };

  // Add subject
  const addSubject = () => {
    setSubjects(prev => [...prev, { name: '', conducted: 10, attended: 8 }]);
  };

  // Remove subject
  const removeSubject = (index) => {
    if (subjects.length <= 1) {
      setErrorMessage('At least one subject is required.');
      return;
    }
    setSubjects(prev => prev.filter((_, i) => i !== index));
    setErrorMessage('');
  };

  // Load example subjects
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

  // Calculate live preview statistics
  let totalConducted = 0;
  let totalAttended = 0;
  let invalidRows = false;

  subjects.forEach(sub => {
    const c = Number(sub.conducted) || 0;
    const a = Number(sub.attended) || 0;
    if (c <= 0 || a < 0 || a > c) invalidRows = true;
    totalConducted += c;
    totalAttended += a;
  });

  const overallPct = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : '0.0';
  const totalMissed = totalConducted - totalAttended;

  // Validation function
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

  // Submit handler
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

      const result = await predictAttendance(student, formattedSubjects);

      // Save to localStorage history
      savePredictionToStorage(result);

      // Notify parent to switch to dashboard
      onPredictionComplete(result, student, formattedSubjects);
    } catch (err) {
      console.error('Prediction failed:', err);
      setErrorMessage(err.message || 'Prediction service is currently unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-view-container animate-fade-in">
      <div className="view-header">
        <div className="view-title-group">
          <h2>Attendance Input Portal</h2>
          <p className="view-subtitle">
            Enter your academic information and dynamic subjects below. No account or login required.
          </p>
        </div>

        <div className="header-actions">
          <button type="button" className="btn-secondary btn-sm" onClick={loadExample}>
            <RefreshCw size={14} />
            <span>Load Sample Data</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="error-banner animate-fade-in">
          <AlertCircle size={20} className="error-icon" />
          <div className="error-text">{errorMessage}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="input-form">
        {/* Student Information Section
        <div className="glass-card section-card">
          <div className="section-header">
            <User size={18} className="text-cyan" />
            <h3>Student Information</h3>
            <span className="optional-tag">(Flexible & Optional)</span>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Student Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Shaik / Aditya"
                value={student.name}
                onChange={(e) => handleStudentChange('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 21A91A0501"
                value={student.roll_number}
                onChange={(e) => handleStudentChange('roll_number', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department / Branch</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. CSE, ECE, EEE, MECH, CIVIL, AI/DS"
                value={student.department}
                onChange={(e) => handleStudentChange('department', e.target.value)}
                list="department-suggestions"
              />
              <datalist id="department-suggestions">
                <option value="CSE" />
                <option value="ECE" />
                <option value="EEE" />
                <option value="IT" />
                <option value="Mechanical" />
                <option value="Civil" />
                <option value="AI / Data Science" />
                <option value="Chemical" />
              </datalist>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Year *</label>
              <select
                className="form-select"
                value={student.year}
                onChange={(e) => handleStudentChange('year', e.target.value)}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Semester *</label>
              <select
                className="form-select"
                value={student.semester}
                onChange={(e) => handleStudentChange('semester', e.target.value)}
              >
                <option value="1">Semester 1 (Odd)</option>
                <option value="2">Semester 2 (Even)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Section</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. A / B / C"
                value={student.section}
                onChange={(e) => handleStudentChange('section', e.target.value)}
              />
            </div>
          </div>
           */}
          {/* <div className="cohort-note">
            <Sparkles size={14} className="text-cyan" />
            <span>Academic Cohort mapped for ML model: <strong>{student.year}-{student.semester}</strong>. (Department is student profile data and is never passed into the ML feature matrix).</span>
          </div>
        </div> */}

        {/* Dynamic Subject Attendance Section */}
        <div className="glass-card section-card">
          <div className="section-header-split">
            <div className="section-header">
              <BookOpen size={18} className="text-cyan" />
              <h3>Subject Attendance Table</h3>
              <span className="badge badge-neutral">{subjects.length} Subjects</span>
            </div>

            <button type="button" className="btn-secondary btn-sm" onClick={addSubject}>
              <Plus size={16} />
              <span>Add Subject</span>
            </button>
          </div>

          <div className="table-responsive">
            <table className="subject-table">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Subject Name</th>
                  <th style={{ width: '22%' }}>Classes Conducted</th>
                  <th style={{ width: '22%' }}>Classes Attended</th>
                  <th style={{ width: '16%' }}>Current %</th>
                  <th style={{ width: '50px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((sub, idx) => {
                  const cond = Number(sub.conducted) || 0;
                  const att = Number(sub.attended) || 0;
                  const pct = cond > 0 ? ((att / cond) * 100).toFixed(1) : 0;
                  const isSafe = pct >= 75;
                  const isRisk = pct >= 65 && pct < 75;

                  return (
                    <tr key={idx} className="subject-row">
                      <td>
                        <input
                          type="text"
                          className="form-input table-input"
                          placeholder={`Subject #${idx + 1}`}
                          value={sub.name}
                          onChange={(e) => handleSubjectChange(idx, 'name', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max="200"
                          className="form-input table-input text-center"
                          value={sub.conducted}
                          onChange={(e) => handleSubjectChange(idx, 'conducted', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          max={sub.conducted || 200}
                          className="form-input table-input text-center"
                          value={sub.attended}
                          onChange={(e) => handleSubjectChange(idx, 'attended', e.target.value)}
                          required
                        />
                      </td>
                      <td>
                        <span className={`pct-indicator ${isSafe ? 'pct-safe' : isRisk ? 'pct-risk' : 'pct-danger'}`}>
                          {pct}%
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn-icon-danger"
                          onClick={() => removeSubject(idx)}
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

          <div className="table-footer-actions">
            <button type="button" className="btn-outline btn-sm" onClick={addSubject}>
              <Plus size={14} />
              <span>Add Another Subject</span>
            </button>
          </div>
        </div>

        {/* Live Calculation Preview Banner */}
        <div className="live-preview-bar glass-card">
          <div className="preview-stat">
            <span className="stat-label">Total Conducted</span>
            <span className="stat-val">{totalConducted}</span>
          </div>
          <div className="preview-divider"></div>
          <div className="preview-stat">
            <span className="stat-label">Total Attended</span>
            <span className="stat-val text-emerald">{totalAttended}</span>
          </div>
          <div className="preview-divider"></div>
          <div className="preview-stat">
            <span className="stat-label">Total Missed</span>
            <span className="stat-val text-rose">{totalMissed}</span>
          </div>
          <div className="preview-divider"></div>
          <div className="preview-stat">
            <span className="stat-label">Current Overall</span>
            <span className={`stat-val-highlight ${Number(overallPct) >= 75 ? 'text-emerald' : Number(overallPct) >= 65 ? 'text-amber' : 'text-rose'}`}>
              {overallPct}%
            </span>
          </div>
        </div>

        {/* Submit Action */}
        <div className="form-submit-container">
          <button
            type="submit"
            className="btn-primary btn-submit-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="spin-icon" />
                <span>Running Random Forest Regressor...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>Predict Future Attendance</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .input-view-container {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }
        .view-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .view-title-group h2 {
          font-size: 1.85rem;
          font-weight: 800;
        }
        .view-subtitle {
          color: var(--text-muted);
          font-size: 0.95rem;
          margin-top: 0.25rem;
        }
        .btn-sm {
          padding: 0.45rem 0.85rem;
          font-size: 0.82rem;
        }
        .error-banner {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          color: #FCA5A5;
        }
        .error-icon {
          color: #EF4444;
          flex-shrink: 0;
        }
        .error-text {
          font-size: 0.92rem;
          font-weight: 500;
        }
        .input-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .section-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
        }
        .section-header h3 {
          font-size: 1.15rem;
          font-weight: 700;
        }
        .optional-tag {
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .section-header-split {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .form-grid-3 {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }
        .cohort-note {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(56, 189, 248, 0.05);
          border: 1px dashed rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-sm);
          padding: 0.6rem 0.9rem;
          font-size: 0.82rem;
          color: var(--text-muted);
        }
        .cohort-note strong {
          color: var(--primary);
        }
        .table-responsive {
          overflow-x: auto;
        }
        .subject-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.92rem;
        }
        .subject-table th {
          text-align: left;
          padding: 0.75rem 0.6rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.04em;
          border-bottom: 1px solid var(--border-subtle);
        }
        .subject-table td {
          padding: 0.6rem;
          border-bottom: 1px solid rgba(148, 163, 184, 0.06);
        }
        .table-input {
          padding: 0.55rem 0.75rem;
          font-size: 0.9rem;
        }
        .text-center {
          text-align: center;
        }
        .pct-indicator {
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: 0.92rem;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          display: inline-block;
        }
        .pct-safe {
          color: var(--safe);
          background: var(--safe-bg);
        }
        .pct-risk {
          color: var(--risk);
          background: var(--risk-bg);
        }
        .pct-danger {
          color: var(--high-risk);
          background: var(--high-risk-bg);
        }
        .btn-icon-danger {
          background: transparent;
          color: var(--text-dim);
          padding: 0.45rem;
          border-radius: var(--radius-sm);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon-danger:hover:not(:disabled) {
          color: var(--high-risk);
          background: rgba(239, 68, 68, 0.1);
        }
        .btn-icon-danger:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .table-footer-actions {
          display: flex;
          justify-content: flex-start;
          padding-top: 0.5rem;
        }
        .live-preview-bar {
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding: 1rem 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
          background: #0E1626;
        }
        .preview-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
        }
        .stat-val {
          font-family: var(--font-mono);
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .stat-val-highlight {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 800;
        }
        .preview-divider {
          width: 1px;
          height: 32px;
          background: rgba(148, 163, 184, 0.15);
        }
        .text-emerald { color: #10B981; }
        .text-amber { color: #F59E0B; }
        .text-rose { color: #EF4444; }
        .form-submit-container {
          display: flex;
          justify-content: center;
          margin-top: 0.5rem;
        }
        .btn-submit-lg {
          padding: 1rem 2.75rem;
          font-size: 1.1rem;
          border-radius: var(--radius-lg);
          gap: 0.65rem;
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.35);
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
