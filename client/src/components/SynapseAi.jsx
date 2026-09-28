import { useState } from 'react';
import { chatWithSynapse } from '../services/api';

export default function SynapseAI({
  student,
  subjects,
  predictionData,
  onClose
}) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: predictionData
        ? "Hi! I'm Synapse AI. Ask me anything about your attendance."
        : "Enter your attendance first, then I can analyze it for you."
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickQuestions = [
    'How is my attendance?',
    'Why am I at risk?',
    'Which subject needs attention?',
    'How many classes can I miss?',
    'How many classes do I need for 75%?'
  ];

  const sendMessage = async (question = input) => {
    const message = question.trim();

    if (!message || loading) return;

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: message
      }
    ]);

    setInput('');
    setLoading(true);

    try {
      const result = await chatWithSynapse(
        message,
        student || {},
        subjects || []
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: result.answer
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            error.message ||
            'Synapse AI is currently unavailable.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="synapse-panel">

      {/* HEADER */}
      <div className="synapse-panel-header">

        <div className="synapse-header-left">

          <div className="synapse-icon">
            ✦
          </div>

          <div>
            <div className="synapse-title">
              Synapse AI
            </div>

            <div className="synapse-subtitle">
              Attendance assistant
            </div>
          </div>

        </div>

        <button
          type="button"
          className="synapse-close"
          onClick={onClose}
          aria-label="Close Synapse AI"
        >
          ×
        </button>

      </div>


      {/* NOTICE */}
      {!predictionData && (
        <div className="synapse-notice">
          Enter your attendance first to let Synapse analyze it.
        </div>
      )}


      {/* CHAT */}
      <div className="synapse-chat">

        {messages.map((message, index) => (
          <div
            key={index}
            className={`synapse-message ${
              message.role === 'user'
                ? 'synapse-user'
                : 'synapse-assistant'
            }`}
          >

            <div className="synapse-message-label">
              {message.role === 'user'
                ? 'You'
                : 'Synapse AI'}
            </div>

            <div className="synapse-message-text">
              {message.text}
            </div>

          </div>
        ))}


        {/* THINKING */}
        {loading && (
          <div className="synapse-message synapse-assistant">

            <div className="synapse-message-label">
              Synapse AI
            </div>

            <div className="synapse-thinking">
              <span></span>
              <span></span>
              <span></span>
            </div>

          </div>
        )}

      </div>


      {/* QUICK QUESTIONS */}
      <div className="synapse-quick">

        <div className="synapse-quick-title">
          Quick questions
        </div>

        <div className="synapse-quick-list">

          {quickQuestions.map((question) => (
            <button
              type="button"
              key={question}
              onClick={() => sendMessage(question)}
              disabled={loading}
            >
              {question}
            </button>
          ))}

        </div>

      </div>


      {/* INPUT */}
      <div className="synapse-input-area">

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your attendance..."
          rows={2}
          disabled={loading}
        />

        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
        >
          {loading ? '...' : 'Send'}
        </button>

      </div>


      {/* STYLES */}
      <style>{`

        /* =====================================
           MAIN PANEL
        ===================================== */

        .synapse-panel {
          height: 100%;
          display: flex;
          flex-direction: column;

          background: #FFFFFF;

          color: #0F172A;

          font-family: var(--font-sans);
        }


        /* =====================================
           HEADER
        ===================================== */

        .synapse-panel-header {
          flex-shrink: 0;

          display: flex;
          align-items: center;
          justify-content: space-between;

          padding: 1rem 1.15rem;

          background: #FFFFFF;

          border-bottom:
            1px solid #E3E8EE;
        }


        .synapse-header-left {
          display: flex;
          align-items: center;

          gap: 0.75rem;
        }


        .synapse-icon {
          width: 38px;
          height: 38px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 10px;

          background:
            linear-gradient(
              135deg,
              #DFF3FA 0%,
              #FFFFFF 50%,
              #FBEDE6 100%
            );

          color: #0F172A;

          font-size: 1.1rem;
          font-weight: 800;

          border:
            1px solid #E3E8EE;

          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.08);
        }


        .synapse-title {
          font-family: var(--font-heading);

          font-size: 1rem;

          font-weight: 800;

          color: #0F172A;
        }


        .synapse-subtitle {
          margin-top: 2px;

          font-size: 0.7rem;

          color: #64748B;
        }


        /* =====================================
           CLOSE BUTTON
        ===================================== */

        .synapse-close {
          width: 36px;
          height: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border:
            1px solid #E3E8EE;

          border-radius: 9px;

          background: #FFFFFF;

          color: #64748B;

          font-size: 1.5rem;
          line-height: 1;

          cursor: pointer;

          transition:
            background 0.2s ease,
            color 0.2s ease,
            border-color 0.2s ease;
        }


        .synapse-close:hover {
          background: #FBEDE6;

          border-color: #E3E8EE;

          color: #0F172A;
        }


        /* =====================================
           NOTICE
        ===================================== */

        .synapse-notice {
          margin: 0.8rem;

          padding: 0.8rem;

          border:
            1px solid #BAE6F3;

          border-radius: 10px;

          font-size: 0.78rem;

          color: #0F172A;

          background: #DFF3FA;
        }


        /* =====================================
           CHAT
        ===================================== */

        .synapse-chat {
          flex: 1;

          overflow-y: auto;

          padding: 1rem;

          background:
            linear-gradient(
              135deg,
              #F8FCFD 0%,
              #FFFFFF 65%,
              #FEFAF8 100%
            );
        }


        .synapse-message {
          max-width: 88%;

          margin-bottom: 0.85rem;

          padding: 0.75rem 0.85rem;

          border-radius: 12px;

          line-height: 1.5;

          font-size: 0.86rem;
        }


        /* =====================================
           AI MESSAGE
        ===================================== */

        .synapse-assistant {
          margin-right: auto;

          background: #FFFFFF;

          border:
            1px solid #E3E8EE;

          box-shadow:
            0 2px 8px
            rgba(15, 23, 42, 0.04);
        }


        /* =====================================
           USER MESSAGE
        ===================================== */

        .synapse-user {
          margin-left: auto;

          background: #0F172A;

          border:
            1px solid #0F172A;

          color: #FFFFFF;
        }


        .synapse-message-label {
          margin-bottom: 0.25rem;

          font-size: 0.68rem;

          font-weight: 800;

          color: #0F172A;
        }


        .synapse-user .synapse-message-label {
          color: #DFF3FA;
        }


        .synapse-message-text {
          white-space: pre-wrap;

          color: #334155;
        }


        .synapse-user .synapse-message-text {
          color: #FFFFFF;
        }


        /* =====================================
           THINKING
        ===================================== */

        .synapse-thinking {
          display: flex;

          gap: 4px;

          padding: 5px 0;
        }


        .synapse-thinking span {
          width: 6px;
          height: 6px;

          border-radius: 50%;

          background: #0F172A;

          animation:
            synapsePulse 1.2s infinite;
        }


        .synapse-thinking span:nth-child(2) {
          animation-delay: 0.2s;
        }


        .synapse-thinking span:nth-child(3) {
          animation-delay: 0.4s;
        }


        @keyframes synapsePulse {

          0%, 60%, 100% {
            opacity: 0.3;
            transform: translateY(0);
          }

          30% {
            opacity: 1;
            transform: translateY(-3px);
          }

        }


        /* =====================================
           QUICK QUESTIONS
        ===================================== */

        .synapse-quick {
          flex-shrink: 0;

          padding: 0.75rem 0.9rem;

          background: #FFFFFF;

          border-top:
            1px solid #E3E8EE;
        }


        .synapse-quick-title {
          margin-bottom: 0.5rem;

          font-size: 0.68rem;

          font-weight: 700;

          color: #64748B;
        }


        .synapse-quick-list {
          display: flex;

          gap: 0.4rem;

          flex-wrap: wrap;
        }


        .synapse-quick button {
          padding:
            0.45rem 0.65rem;

          border:
            1px solid #E3E8EE;

          border-radius: 999px;

          background: #FFFFFF;

          color: #0F172A;

          font-size: 0.7rem;

          cursor: pointer;

          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease;
        }


        .synapse-quick button:hover:not(:disabled) {
          background: #DFF3FA;

          border-color: #BAE6F3;

          color: #0F172A;
        }


        .synapse-quick button:disabled {
          opacity: 0.45;

          cursor: not-allowed;
        }


        /* =====================================
           INPUT AREA
        ===================================== */

        .synapse-input-area {
          flex-shrink: 0;

          display: flex;

          gap: 0.55rem;

          padding: 0.8rem;

          background: #FFFFFF;

          border-top:
            1px solid #E3E8EE;
        }


        .synapse-input-area textarea {
          flex: 1;

          resize: none;

          padding: 0.7rem 0.75rem;

          border:
            1px solid #E3E8EE;

          border-radius: 10px;

          outline: none;

          background: #F8FAFC;

          color: #0F172A;

          font-family: inherit;

          font-size: 0.8rem;

          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }


        .synapse-input-area textarea::placeholder {
          color: #94A3B8;
        }


        .synapse-input-area textarea:focus {
          border-color: #0F172A;

          box-shadow:
            0 0 0 3px
            rgba(15, 23, 42, 0.08);

          background: #FFFFFF;
        }


        /* =====================================
           SEND BUTTON
        ===================================== */

        .synapse-input-area button {
          align-self: stretch;

          padding: 0 1rem;

          border: none;

          border-radius: 10px;

          background: #0F172A;

          color: #FFFFFF;

          font-weight: 700;

          cursor: pointer;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }


        .synapse-input-area button:hover:not(:disabled) {
          transform: translateY(-1px);

          background: #1E293B;

          box-shadow:
            0 5px 14px
            rgba(15, 23, 42, 0.18);
        }


        .synapse-input-area button:disabled {
          opacity: 0.45;

          cursor: not-allowed;
        }


        /* =====================================
           MOBILE
        ===================================== */

        @media (max-width: 600px) {

          .synapse-panel-header {
            padding: 0.9rem;
          }

          .synapse-chat {
            padding: 0.8rem;
          }

          .synapse-message {
            max-width: 92%;
          }

          .synapse-input-area {
            padding: 0.7rem;
          }

        }

      `}</style>

    </div>
  );
}