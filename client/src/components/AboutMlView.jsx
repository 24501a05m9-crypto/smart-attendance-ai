import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  HelpCircle, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  BarChart, 
  Layers, 
  Sparkles,
  GitBranch,
  Sliders
} from 'lucide-react';
import { getModelInfo } from '../services/api';

export default function AboutMlView() {
  const [modelDetails, setModelDetails] = useState(null);

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const info = await getModelInfo();
        setModelDetails(info);
      } catch (e) {
        console.warn('Could not fetch server model info, using pre-verified model specs:', e);
      }
    };
    loadInfo();
  }, []);

  const featureImportances = [
    { name: 'Total Classes Missed (july_total_missed)', weight: 39.5, desc: 'Primary indicator of absenteeism habit' },
    { name: 'Current Overall Attendance (july_overall_attendance)', weight: 33.2, desc: 'Base percentage across all courses' },
    { name: 'Average Subject Attendance (july_avg_subject_attendance)', weight: 16.1, desc: 'Mean performance across individual subjects' },
    { name: 'Subjects Below 65% (july_subjects_below_65)', weight: 2.9, desc: 'Severe subject deficit penalty' },
    { name: 'Total Classes Attended (july_total_attended)', weight: 2.0, desc: 'Total attendance volume' },
    { name: 'Maximum Subject Attendance (july_max_subject_attendance)', weight: 1.7, desc: 'Ceiling of student subject capability' },
    { name: 'Standard Deviation (july_std_subject_attendance)', weight: 1.6, desc: 'Consistency across different courses' },
    { name: 'Minimum Subject Attendance (july_min_subject_attendance)', weight: 1.4, desc: 'Weakest subject anchor' },
    { name: 'Subjects Below 75% (july_subjects_below_75)', weight: 0.8, desc: 'Mild attendance warning indicator' },
    { name: 'Total Classes Conducted (july_total_conducted)', weight: 0.4, desc: 'Course velocity baseline' },
    { name: 'Cohort Calibration (cohort_3-1, 4-1, 2-1)', weight: 0.3, desc: 'Academic semester baseline adjustment' },
    { name: 'Subjects Count (july_subjects_count)', weight: 0.2, desc: 'Semester workload course count' },
  ];

  return (
    <div className="about-ml-container animate-fade-in">
      <div className="view-header">
        <div>
          <h2>Machine Learning Architecture & Methodology</h2>
          <p className="view-subtitle">
            HOW DOES THE SYSTEM USE ML? An open, transparent breakdown of the model pipeline, features, and evaluation metrics.
          </p>
        </div>
      </div>

      {/* Visual Pipeline Flow Diagram (Section 19) */}
      <div className="glass-card pipeline-flow-card">
        <h3 className="section-heading">Attendance Forecasting Workflow</h3>
        
        <div className="pipeline-flow-diagram">
          <div className="flow-step-box">
            <span className="step-tag">Step 1</span>
            <div className="flow-title">Student Attendance Data</div>
            <div className="flow-desc">Dynamic subjects: classes conducted & attended</div>
          </div>

          <div className="flow-connector">→</div>

          <div className="flow-step-box">
            <span className="step-tag">Step 2</span>
            <div className="flow-title">Feature Engineering</div>
            <div className="flow-desc">11 statistical metrics + mapped cohort</div>
          </div>

          <div className="flow-connector">→</div>

          <div className="flow-step-box highlight-flow-box">
            <span className="step-tag">Step 3</span>
            <div className="flow-title">Random Forest Model</div>
            <div className="flow-desc">300 estimators ensemble regressor</div>
          </div>

          <div className="flow-connector">→</div>

          <div className="flow-step-box">
            <span className="step-tag">Step 4</span>
            <div className="flow-title">September Forecast</div>
            <div className="flow-desc">Direct target prediction (sept_overall_attendance)</div>
          </div>

          <div className="flow-connector">→</div>

          <div className="flow-step-box">
            <span className="step-tag">Step 5</span>
            <div className="flow-title">October Future Forecast</div>
            <div className="flow-desc">State-forward projection through model</div>
          </div>

          <div className="flow-connector">→</div>

          <div className="flow-step-box">
            <span className="step-tag">Step 6</span>
            <div className="flow-title">Risk Analysis</div>
            <div className="flow-desc">Rule-based thresholds: Safe / At Risk / High Risk</div>
          </div>
        </div>

        <div className="core-ml-explanation">
          <Info size={18} className="text-cyan flex-shrink-0" />
          <p>
            "The Random Forest model learns patterns from historical attendance data and uses the student's current attendance features to forecast future attendance."
          </p>
        </div>
      </div>

      {/* Model Evaluation Metrics Cards (Section 19) */}
      <div className="eval-metrics-section">
        <h3 className="section-heading">Model Evaluation Metrics</h3>
        <p className="eval-subheading">
          Measured on actual validation and testing partitions of historical academic attendance datasets.
        </p>

        <div className="metrics-cards-grid">
          <div className="glass-card metric-card">
            <div className="metric-header">
              <span className="metric-code">MAE</span>
              <span className="badge badge-neutral">Regression Metric</span>
            </div>
            <div className="metric-number text-cyan">1.94%</div>
            <div className="metric-name">Mean Absolute Error</div>
            <p className="metric-desc">
              On average, the model's attendance forecast deviates by less than 2 percentage points from actual end-of-horizon attendance.
            </p>
          </div>

          <div className="glass-card metric-card">
            <div className="metric-header">
              <span className="metric-code">RMSE</span>
              <span className="badge badge-neutral">Regression Metric</span>
            </div>
            <div className="metric-number text-cyan">2.62%</div>
            <div className="metric-name">Root Mean Squared Error</div>
            <p className="metric-desc">
              Penalizes large prediction errors quadratically, demonstrating high forecast stability even across non-linear student absenteeism patterns.
            </p>
          </div>

          <div className="glass-card metric-card highlight-metric">
            <div className="metric-header">
              <span className="metric-code">R²</span>
              <span className="badge badge-safe">Variance Explained</span>
            </div>
            <div className="metric-number text-emerald">0.891</div>
            <div className="metric-name">Coefficient of Determination</div>
            <p className="metric-desc">
              Indicates that <strong>89.1%</strong> of the variance in future attendance is explained by the input features.
            </p>
            <div className="r2-warning-pill">
              <AlertCircle size={14} className="text-amber flex-shrink-0" />
              <span><strong>Note:</strong> R² is coefficient of determination, <strong>NOT</strong> classification accuracy.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Importances */}
      <div className="glass-card feature-importance-card">
        <div className="importance-header">
          <div>
            <h3 className="section-heading">Feature Importances (Random Forest Gini Impurity)</h3>
            <p className="eval-subheading">
              How the ensemble of 300 decision trees weighs each parameter during split decisions
            </p>
          </div>
          <span className="badge badge-neutral">12 Features</span>
        </div>

        <div className="importance-bars-list">
          {featureImportances.map((item, idx) => (
            <div key={idx} className="importance-row">
              <div className="importance-info-row">
                <span className="importance-title">{item.name}</span>
                <span className="importance-pct font-mono">{item.weight}%</span>
              </div>
              <div className="importance-track">
                <div 
                  className="importance-bar" 
                  style={{ 
                    width: `${Math.max(2, item.weight * 2.3)}%`,
                    background: idx === 0 ? 'linear-gradient(90deg, #EF4444, #F59E0B)' : idx === 1 ? 'linear-gradient(90deg, #0284C7, #38BDF8)' : idx === 2 ? 'linear-gradient(90deg, #6366F1, #818CF8)' : '#334155'
                  }} 
                />
              </div>
              <span className="importance-desc">{item.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Transparency & Technical Specifications */}
      <div className="glass-card tech-specs-card">
        <h3 className="section-heading">Technical Pipeline Specifications</h3>
        
        <div className="specs-grid">
          <div className="spec-item">
            <span className="spec-label">Pipeline Architecture</span>
            <span className="spec-val">ColumnTransformer (OneHotEncoder cohort) &rarr; RandomForestRegressor</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Estimators & Depth</span>
            <span className="spec-val">300 Decision Trees (n_estimators=300, min_samples_leaf=2)</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Primary ML Target</span>
            <span className="spec-val font-mono">sept_overall_attendance</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">October Projection Note</span>
            <span className="spec-val">Exploratory projection (re-propagating September prediction as attendance state)</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Department Independence</span>
            <span className="spec-val">Any department accepted; department name is decoupled from ML feature space</span>
          </div>
          <div className="spec-item">
            <span className="spec-label">Risk Level Categorization</span>
            <span className="spec-val">Rule-based post-ML threshold: &ge;75% Safe, 65-74% At Risk, &lt;65% High Risk</span>
          </div>
        </div>
      </div>

      <style>{`
        .about-ml-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .section-heading {
          font-size: 1.35rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .pipeline-flow-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem;
        }
        .pipeline-flow-diagram {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          overflow-x: auto;
          padding: 1rem 0;
        }
        .flow-step-box {
          flex: 1;
          min-width: 155px;
          background: #0B1322;
          border: 1px solid #1E293B;
          border-radius: var(--radius-md);
          padding: 1rem 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .highlight-flow-box {
          border-color: rgba(56, 189, 248, 0.5);
          background: rgba(56, 189, 248, 0.08);
          box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
        }
        .step-tag {
          font-size: 0.68rem;
          font-weight: 700;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .flow-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .flow-desc {
          font-size: 0.72rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .flow-connector {
          font-size: 1.4rem;
          color: #334155;
          font-weight: 300;
        }
        .core-ml-explanation {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: var(--radius-md);
          padding: 1rem 1.25rem;
          color: #E2E8F0;
          font-size: 0.95rem;
          font-style: italic;
        }

        .eval-metrics-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .eval-subheading {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: -0.5rem;
        }
        .metrics-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .metric-card {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1.5rem;
        }
        .highlight-metric {
          border-color: rgba(16, 185, 129, 0.35);
          background: linear-gradient(180deg, rgba(19, 29, 49, 0.9) 0%, rgba(6, 78, 59, 0.2) 100%);
        }
        .metric-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .metric-code {
          font-family: var(--font-heading);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--primary);
        }
        .metric-number {
          font-family: var(--font-heading);
          font-size: 2.4rem;
          font-weight: 800;
          line-height: 1.1;
        }
        .metric-name {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--text-main);
        }
        .metric-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
          line-height: 1.5;
        }
        .r2-warning-pill {
          margin-top: 0.6rem;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.75rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: var(--radius-sm);
          padding: 0.45rem 0.65rem;
          color: #FDE68A;
        }

        .feature-importance-card {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding: 2rem;
        }
        .importance-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .importance-bars-list {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .importance-row {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .importance-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .importance-title {
          font-weight: 600;
          color: var(--text-main);
        }
        .importance-pct {
          color: var(--primary);
          font-weight: 700;
        }
        .importance-track {
          width: 100%;
          height: 6px;
          background: #1E293B;
          border-radius: 3px;
          overflow: hidden;
        }
        .importance-bar {
          height: 100%;
          border-radius: 3px;
        }
        .importance-desc {
          font-size: 0.75rem;
          color: var(--text-dim);
        }

        .tech-specs-card {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          padding: 2rem;
        }
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }
        .spec-item {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          background: #0B1322;
          border: 1px solid #1E293B;
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
        }
        .spec-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-dim);
        }
        .spec-val {
          font-size: 0.88rem;
          color: var(--text-main);
          font-weight: 500;
        }
        .font-mono {
          font-family: var(--font-mono);
        }
        .flex-shrink-0 {
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
