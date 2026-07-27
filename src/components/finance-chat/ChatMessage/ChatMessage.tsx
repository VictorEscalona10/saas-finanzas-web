'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage as ChatMessageData } from '@/src/use-cases/finance-chat/useFinanceChat';
import './ChatMessage.css';

export interface ChatMessageProps {
  message: ChatMessageData;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`chat-message chat-message--${isUser ? 'user' : 'assistant'}`}>
      {!isUser && (
        <span className="chat-message__avatar material-symbols-outlined">smart_toy</span>
      )}
      <div className="chat-message__body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ className, children, ...props }) {
              const isInline = !className;
              if (isInline) {
                return <code className="chat-message__code-inline" {...props}>{children}</code>;
              }
              return (
                <pre className="chat-message__code-block">
                  <code className={className} {...props}>{children}</code>
                </pre>
              );
            },
            table({ children }) {
              return (
                <div className="chat-message__table-wrapper">
                  <table className="chat-message__table">{children}</table>
                </div>
              );
            },
            a({ href, children }) {
              return (
                <a className="chat-message__link" href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              );
            },
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
