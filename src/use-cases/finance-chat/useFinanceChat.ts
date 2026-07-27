'use client';

import { useState, useCallback } from 'react';
import { useSession } from '@/src/use-cases/auth/useSession';
import { FinanceChatRepositoryImpl } from '@/src/infrastructure/repositories/FinanceChatRepositoryImpl';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface FinanceChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
}

export function useFinanceChat(companyId: string | undefined) {
  const { session, isAuthenticated } = useSession();
  const [state, setState] = useState<FinanceChatState>({
    messages: [],
    loading: false,
    error: null,
  });

  const sendMessage = useCallback(async (question: string) => {
    if (!session || !isAuthenticated || !companyId) {
      setState((prev) => ({ ...prev, error: 'No autenticado' }));
      return;
    }

    if (!question.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: question };
    setState((prev) => ({
      messages: [...prev.messages, userMessage],
      loading: true,
      error: null,
    }));

    const token = (session as { access_token: string }).access_token;
    const repo = new FinanceChatRepositoryImpl(token);

    try {
      const { response } = await repo.ask(companyId, question);
      const assistantMessage: ChatMessage = { role: 'assistant', content: response };
      setState((prev) => ({
        messages: [...prev.messages, assistantMessage],
        loading: false,
        error: null,
      }));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al enviar mensaje';
      setState((prev) => ({
        messages: prev.messages.slice(0, -1),
        loading: false,
        error: message,
      }));
    }
  }, [session, isAuthenticated, companyId]);

  const clearMessages = useCallback(() => {
    setState({ messages: [], loading: false, error: null });
  }, []);

  return { ...state, sendMessage, clearMessages };
}
