'use client';

import { useState, useRef, useEffect } from 'react';
import { useFinanceChat } from '@/src/use-cases/finance-chat/useFinanceChat';
import ChatMessage from '@/src/components/finance-chat/ChatMessage';
import './ChatWidget.css';

interface ChatWidgetProps {
  companyId: string;
}

function WelcomeMessage() {
  return (
    <div className="chat-widget__welcome">
      <span className="chat-widget__welcome-icon material-symbols-outlined">smart_toy</span>
      <p className="chat-widget__welcome-text">
        Pregúntame sobre tus finanzas. Por ejemplo:
      </p>
      <ul className="chat-widget__suggestions">
        <li>¿Cuál fue el margen de contribución del mes pasado?</li>
        <li>¿Cómo van los ingresos este mes?</li>
        <li>¿Cuáles son mis gastos más altos?</li>
      </ul>
    </div>
  );
}

export default function ChatWidget({ companyId }: ChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { messages, loading, error, sendMessage, clearMessages } = useFinanceChat(companyId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    setInput('');
    await sendMessage(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button
        className={`chat-widget__fab${open ? ' chat-widget__fab--open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        <span className="material-symbols-outlined">
          {open ? 'close' : 'smart_toy'}
        </span>
      </button>

      {open && (
        <div className={`chat-widget__panel${expanded ? ' chat-widget__panel--expanded' : ''}`}>
          <div className="chat-widget__header">
            <div className="chat-widget__header-left">
              <span className="chat-widget__header-icon material-symbols-outlined">smart_toy</span>
              <div>
                <h2 className="chat-widget__header-title">Asistente Financiero</h2>
                <p className="chat-widget__header-status">Conectado</p>
              </div>
            </div>
            <div className="chat-widget__header-actions">
              <button
                className="chat-widget__header-btn"
                onClick={clearMessages}
                title="Limpiar conversación"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
              <button
                className="chat-widget__header-btn"
                onClick={() => setExpanded((prev) => !prev)}
                title={expanded ? 'Reducir' : 'Ampliar'}
              >
                <span className="material-symbols-outlined">
                  {expanded ? 'close_fullscreen' : 'open_in_full'}
                </span>
              </button>
              <button
                className="chat-widget__header-btn"
                onClick={() => setOpen(false)}
                title="Cerrar"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <div className="chat-widget__messages">
            {messages.length === 0 && !loading && <WelcomeMessage />}
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            {loading && (
              <div className="chat-widget__bubble chat-widget__bubble--assistant">
                <div className="chat-widget__bubble-content">
                  <span className="chat-widget__bubble-avatar material-symbols-outlined">smart_toy</span>
                  <div className="chat-widget__typing">
                    <span className="chat-widget__typing-dot" />
                    <span className="chat-widget__typing-dot" />
                    <span className="chat-widget__typing-dot" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="chat-widget__error">
                <span className="material-symbols-outlined chat-widget__error-icon">error_outline</span>
                <span className="chat-widget__error-text">{error}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-widget__input-area">
            <textarea
              ref={inputRef}
              className="chat-widget__input"
              placeholder="Escribe tu pregunta..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={loading}
            />
            <button
              className="chat-widget__send-btn"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              aria-label="Enviar"
            >
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
