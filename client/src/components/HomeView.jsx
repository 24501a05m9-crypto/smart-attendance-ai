import React from 'react';
import { 
  ArrowRight, 
  ShieldOff, 
  Cpu, 
  CalendarDays, 
  SlidersHorizontal, 
  CheckCircle2, 
  Sparkles, 
  GraduationCap,
  Layers,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function HomeView({ onStart }) {
  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-pill">
          <Sparkles size={14} className="hero-pill-sparkle" />
          <span>General Purpose AI for All College Students</span>
        </div>

        <h1 className="hero-heading">
          SMART ATTENDANCE <span className="gradient-text">AI</span>
        </h1>

        <p className="hero-subtitle">
          "Predict your future attendance before it becomes a problem."
        </p>

        <p className="hero-description">
          Powered by a trained <strong>Random Forest Regressor</strong> model. Simply enter your current classes conducted and attended to get instant forecasts, risk assessment, and safe leave planning.
        </p>

        <div className="hero-cta-group">
          <button className="btn-primary hero-btn-lg" onClick={onStart}>
            <span>Check My Attendance</span>
            <ArrowRight size={20} />
          </button>
        </div>

        {/* Instant Access Guarantee Banner */}
        <div className="instant-access-banner">
          <div className="banner-item">
            <ShieldOff size={16} className="text-cyan" />
            <span>Zero Login & No Registration</span>
          </div>
          <div className="banner-divider">•</div>
          <div className="banner-item">
            <GraduationCap size={16} className="text-cyan" />
            <span>Any Department & Year</span>
          </div>
          <div className="banner-divider">•</div>
          <div className="banner-item">
            <Cpu size={16} className="text-cyan" />
            <span>Real Trained ML Pipeline</span>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="features-grid">
        <div className="glass-card feature-card">
          <div className="feature-icon-box cyan-glow">
            <Cpu size={24} className="text-cyan" />
          </div>
          <h3 className="feature-title">Trained ML Model</h3>
          <p className="feature-desc">
            Powered by a 300-tree Random Forest Regressor trained on real academic attendance distributions. No dummy predictions or simple math tricks.
          </p>
          <div className="feature-tags">
            <span className="mini-tag">12 Features</span>
            <span className="mini-tag">OneHot Cohort</span>
            <span className="mini-tag">scikit-learn</span>
          </div>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon-box purple-glow">
            <CalendarDays size={24} className="text-purple" />
          </div>
          <h3 className="feature-title">Dual Horizon Forecast</h3>
          <p className="feature-desc">
            Get your trained <strong>September Model Forecast</strong> along with an exploratory <strong>October Future Forecast</strong> to know where you stand well in advance.
          </p>
          <div className="feature-tags">
            <span className="mini-tag">September Target</span>
            <span className="mini-tag">October Projection</span>
          </div>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon-box amber-glow">
            <SlidersHorizontal size={24} className="text-amber" />
          </div>
          <h3 className="feature-title">"Can I Take Leave?" Simulator</h3>
          <p className="feature-desc">
            Simulate missing 1, 2, or 5 upcoming classes. The ML pipeline recalibrates all statistical features and predicts your resulting future attendance.
          </p>
          <div className="feature-tags">
            <span className="mini-tag">Safe Leave Calculator</span>
            <span className="mini-tag">Impact Trajectory</span>
          </div>
        </div>

        <div className="glass-card feature-card">
          <div className="feature-icon-box green-glow">
            <Layers size={24} className="text-emerald" />
          </div>
          <h3 className="feature-title">Universal Compatibility</h3>
          <p className="feature-desc">
            Designed for ANY student: CSE, ECE, EEE, Mechanical, Civil, AI/DS, or any branch; 1st, 2nd, 3rd, or 4th year; any semester. Enter any subjects dynamically.
          </p>
          <div className="feature-tags">
            <span className="mini-tag">Flexible Cohort</span>
            <span className="mini-tag">Dynamic Subjects</span>
          </div>
        </div>
      </section>

      {/* How It Works Workflow */}
      <section className="workflow-section glass-card">
        <h2 className="section-title text-center">How It Works in 3 Steps</h2>
        <div className="steps-row">
          <div className="step-col">
            <div className="step-num">01</div>
            <h4>Enter Current Classes</h4>
            <p>Add your subjects with classes conducted and attended so far. No account creation required.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-col">
            <div className="step-num">02</div>
            <h4>Automated ML Engineering</h4>
            <p>The system calculates 11 statistical features (overall, mean, std dev, thresholds) and maps your cohort.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step-col">
            <div className="step-num">03</div>
            <h4>Forecast & Plan Leaves</h4>
            <p>View your September and October forecasts, risk tier, and simulate leaves with zero guesswork.</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <button className="btn-primary" onClick={onStart}>
            Get Started Now
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 3.5rem;
          padding-top: 1rem;
        }
        .hero-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          max-width: 840px;
          margin: 0 auto;
        }
        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1rem;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.3);
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--primary);
          margin-bottom: 1.5rem;
        }
        .hero-pill-sparkle {
          color: #38BDF8;
        }
        .hero-heading {
          font-size: clamp(2.5rem, 6vw, 4.2rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          margin-bottom: 1.25rem;
        }
        .gradient-text {
          background: linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-subtitle {
          font-size: clamp(1.2rem, 2.5vw, 1.6rem);
          color: #E2E8F0;
          font-weight: 600;
          margin-bottom: 1rem;
          font-style: italic;
        }
        .hero-description {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 680px;
          line-height: 1.7;
          margin-bottom: 2rem;
        }
        .hero-btn-lg {
          padding: 0.95rem 2.25rem;
          font-size: 1.1rem;
          border-radius: var(--radius-lg);
        }
        .instant-access-banner {
          margin-top: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
          padding: 0.75rem 1.5rem;
          background: rgba(19, 29, 49, 0.5);
          border: 1px solid rgba(148, 163, 184, 0.12);
          border-radius: 9999px;
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .banner-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }
        .banner-divider {
          color: #334155;
        }
        .text-cyan { color: #38BDF8; }
        .text-purple { color: #A855F7; }
        .text-amber { color: #F59E0B; }
        .text-emerald { color: #10B981; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }
        .feature-card {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 0.75rem;
        }
        .feature-icon-box {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.5rem;
        }
        .cyan-glow {
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.25);
        }
        .purple-glow {
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.25);
        }
        .amber-glow {
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
        }
        .green-glow {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.25);
        }
        .feature-title {
          font-size: 1.2rem;
          font-weight: 700;
        }
        .feature-desc {
          font-size: 0.92rem;
          color: var(--text-muted);
          line-height: 1.6;
          flex: 1;
        }
        .feature-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
          margin-top: 0.5rem;
        }
        .mini-tag {
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.2rem 0.55rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 6px;
          color: var(--text-muted);
        }

        .workflow-section {
          padding: 2.5rem;
        }
        .section-title {
          font-size: 1.6rem;
          font-weight: 700;
          margin-bottom: 2rem;
        }
        .text-center { text-align: center; }
        .mt-6 { margin-top: 2rem; }
        .steps-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .step-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.5rem;
        }
        .step-num {
          font-family: var(--font-mono);
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--primary);
          line-height: 1;
        }
        .step-col h4 {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .step-col p {
          font-size: 0.88rem;
          color: var(--text-muted);
        }
        .step-arrow {
          font-size: 1.8rem;
          color: #334155;
          font-weight: 300;
        }
        @media (max-width: 768px) {
          .steps-row {
            flex-direction: column;
          }
          .step-arrow {
            transform: rotate(90deg);
          }
        }
      `}</style>
    </div>
  );
}
