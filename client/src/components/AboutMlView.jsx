import React from 'react';
import {
  Brain,
  BarChart3,
  CalendarCheck,
  Sparkles
} from 'lucide-react';

export default function AboutMlView() {
  const features = [
    {
      icon: Brain,
      title: 'ML Model',
      text: 'Uses a trained machine learning model to analyze attendance patterns and estimate future attendance risk.',
      className: 'about-blue'
    },
    {
      icon: BarChart3,
      title: 'Attendance Analysis',
      text: 'Analyzes overall and subject-wise attendance to identify students who may fall below important thresholds.',
      className: 'about-peach'
    },
    {
      icon: CalendarCheck,
      title: 'Leave Planning',
      text: 'Simulates missed classes and shows how different leave plans can affect future attendance.',
      className: 'about-green'
    },
    {
      icon: Sparkles,
      title: 'Synapse AI',
      text: 'Provides a simple conversational interface for questions about your attendance prediction.',
      className: 'about-navy'
    }
  ];

  return (
    <div className="about-page animate-fade-in">

      <div className="about-hero">

        <div className="about-badge">
          <Brain size={15} />
          MACHINE LEARNING
        </div>

        <h1>
          About the Attendance
          <span> Prediction System</span>
        </h1>

        <p>
          A smart attendance analysis system that combines
          mathematical calculations, machine learning and AI
          assistance to help students understand their attendance.
        </p>

      </div>


      <div className="about-grid">

        {features.map((feature) => {

          const Icon = feature.icon;

          return (
            <article
              className={`about-card ${feature.className}`}
              key={feature.title}
            >

              <div className="about-card-icon">
                <Icon size={21} />
              </div>

              <h2>{feature.title}</h2>

              <p>{feature.text}</p>

            </article>
          );
        })}

      </div>


      <style>{`

        .about-page {
          width: min(1050px, 92%);
          margin: 0 auto;
          padding: 3rem 0 4rem;
        }

        .about-hero {
          text-align: center;
          max-width: 760px;
          margin: 0 auto 2.5rem;
        }

        .about-badge {
          display: inline-flex;
          align-items: center;
          gap: .4rem;
          padding: .45rem .75rem;
          border-radius: 999px;
          background: var(--bg-ice);
          border: 1px solid var(--accent-border);
          color: var(--primary);
          font-size: .72rem;
          font-weight: 800;
          letter-spacing: .08em;
        }

        .about-hero h1 {
          margin: 1rem 0 .8rem;
          color: var(--text-main);
          font-size: clamp(2rem, 5vw, 3rem);
          line-height: 1.1;
        }

        .about-hero h1 span {
          display: inline;
          color: var(--primary);
          position: relative;
        }

        .about-hero h1 span::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -5px;
          height: 5px;
          border-radius: 99px;
          background: linear-gradient(
            90deg,
            var(--bg-ice),
            var(--bg-peach)
          );
        }

        .about-hero p {
          margin: 0;
          color: var(--text-muted);
          line-height: 1.7;
        }

        .about-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .about-card {
          padding: 1.4rem;
          background: #fff;
          border: 1px solid var(--border-card);
          border-radius: 16px;
          box-shadow: 0 8px 25px rgba(15,23,42,.045);
          transition: .2s ease;
        }

        .about-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(15,23,42,.08);
        }

        .about-card-icon {
          width: 45px;
          height: 45px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          margin-bottom: 1rem;
        }

        .about-card h2 {
          margin: 0 0 .5rem;
          color: var(--text-main);
          font-size: 1.05rem;
        }

        .about-card p {
          margin: 0;
          color: var(--text-muted);
          line-height: 1.6;
          font-size: .88rem;
        }

        .about-blue .about-card-icon {
          background: var(--bg-ice);
          color: var(--primary);
          border: 1px solid var(--accent-border);
        }

        .about-peach .about-card-icon {
          background: var(--bg-peach);
          color: var(--primary);
          border: 1px solid #F4D7C9;
        }

        .about-green .about-card-icon {
          background: var(--safe-bg);
          color: var(--safe);
          border: 1px solid var(--safe-border);
        }

        .about-navy .about-card-icon {
          background: var(--primary);
          color: #fff;
          border: 1px solid var(--primary);
        }

        @media (max-width: 650px) {
          .about-grid {
            grid-template-columns: 1fr;
          }

          .about-page {
            padding-top: 2rem;
          }
        }

      `}</style>

    </div>
  );
}