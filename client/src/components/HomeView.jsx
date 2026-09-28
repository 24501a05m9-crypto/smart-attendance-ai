import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomeView({ onStart }) {
  return (
    <div className="home-container animate-fade-in">

      <section className="hero-section">

        {/* Small label */}

        <div className="hero-pill">
          <span className="hero-dot"></span>
          Smart Attendance Prediction
        </div>


        {/* Main heading */}

        <h1 className="hero-heading">
          Predict Your{' '}
          <span className="hero-highlight">
            Attendance
          </span>
        </h1>


        {/* Main subtitle */}

        <p className="hero-subtitle">
          Know where your attendance stands before it becomes a problem.
        </p>


        {/* Description */}

        <p className="hero-description">
          Enter your current attendance details to get your attendance
          prediction, risk level and safe leave possibilities.
        </p>


        {/* Main action */}

        <button
          type="button"
          className="btn-primary hero-btn-lg"
          onClick={onStart}
        >
          <Sparkles size={18} />
          <span>Predict Attendance</span>
          <ArrowRight size={19} />
        </button>

      </section>


      <style>{`

        /* =========================================
           HOME CONTAINER
        ========================================= */

        .home-container {
          width: 100%;

          min-height: calc(100vh - 76px);

          display: flex;

          align-items: center;

          justify-content: center;

          box-sizing: border-box;

          padding:
            2rem 1.5rem 4rem;

          position: relative;

          overflow: hidden;
        }


        /* =========================================
           SOFT BACKGROUND ACCENTS
        ========================================= */

        .home-container::before {
          content: '';

          position: absolute;

          width: 420px;

          height: 420px;

          top: -160px;

          left: -120px;

          border-radius: 50%;

          background:
            rgba(223, 243, 250, 0.65);

          filter: blur(30px);

          pointer-events: none;
        }


        .home-container::after {
          content: '';

          position: absolute;

          width: 420px;

          height: 420px;

          right: -150px;

          bottom: -180px;

          border-radius: 50%;

          background:
            rgba(251, 237, 230, 0.72);

          filter: blur(30px);

          pointer-events: none;
        }


        /* =========================================
           HERO
        ========================================= */

        .hero-section {
          width: 100%;

          max-width: 850px;

          min-height: 500px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          position: relative;

          z-index: 1;
        }


        /* =========================================
           HERO PILL
        ========================================= */

        .hero-pill {
          display: inline-flex;

          align-items: center;

          gap: 0.55rem;

          padding:
            0.45rem 0.9rem;

          margin-bottom: 1.5rem;

          border:
            1px solid #C5E6EE;

          border-radius: 999px;

          background:
            rgba(255, 255, 255, 0.78);

          color: #334155;

          font-size: 0.78rem;

          font-weight: 600;

          box-shadow:
            0 3px 12px rgba(15, 23, 42, 0.04);

          backdrop-filter: blur(8px);
        }


        .hero-dot {
          width: 7px;

          height: 7px;

          flex-shrink: 0;

          border-radius: 50%;

          background: #10B981;

          box-shadow:
            0 0 0 3px rgba(16, 185, 129, 0.10);
        }


        /* =========================================
           MAIN HEADING
        ========================================= */

        .hero-heading {
          margin: 0;

          color: #0F172A;

          font-size:
            clamp(2.8rem, 6vw, 4.8rem);

          font-weight: 800;

          line-height: 1.05;

          letter-spacing: -0.045em;
        }


        /* =========================================
           HIGHLIGHTED WORD
        ========================================= */

        .hero-highlight {
          position: relative;

          color: #0F172A;

          display: inline-block;
        }


        .hero-highlight::after {
          content: '';

          position: absolute;

          left: 3%;

          right: 3%;

          bottom: -5px;

          height: 7px;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              #DFF3FA,
              #FBEDE6
            );

          z-index: -1;
        }


        /* =========================================
           SUBTITLE
        ========================================= */

        .hero-subtitle {
          margin:
            1.5rem 0 0;

          color: #334155;

          font-size:
            clamp(1.05rem, 2vw, 1.3rem);

          font-weight: 600;

          line-height: 1.5;
        }


        /* =========================================
           DESCRIPTION
        ========================================= */

        .hero-description {
          max-width: 650px;

          margin:
            1rem 0 0;

          color: #64748B;

          font-size: 0.98rem;

          line-height: 1.7;
        }


        /* =========================================
           MAIN BUTTON
        ========================================= */

        .hero-btn-lg {
          margin-top: 2rem;

          min-height: 50px;

          display: inline-flex;

          align-items: center;

          justify-content: center;

          gap: 0.55rem;

          padding:
            0.85rem 1.35rem;

          border-radius: var(--radius-md);

          font-size: 0.95rem;

          font-weight: 700;

          cursor: pointer;
        }


        .hero-btn-lg:hover {
          transform: translateY(-2px);

          box-shadow:
            0 10px 26px
            rgba(15, 23, 42, 0.18);
        }


        .hero-btn-lg svg {
          flex-shrink: 0;
        }


        /* =========================================
           RESPONSIVE
        ========================================= */

        @media (max-width: 750px) {

          .home-container {
            min-height:
              calc(100vh - 70px);

            padding:
              1rem 1rem 3rem;
          }


          .hero-section {
            min-height: 430px;
          }

        }


        @media (max-width: 500px) {

          .hero-heading {
            font-size: 2.7rem;
          }


          .hero-subtitle {
            font-size: 1rem;
          }


          .hero-description {
            font-size: 0.88rem;

            max-width: 95%;
          }


          .hero-pill {
            font-size: 0.72rem;

            padding:
              0.4rem 0.75rem;
          }


          .hero-btn-lg {
            width: 100%;

            max-width: 280px;
          }

        }

      `}</style>

    </div>
  );
}