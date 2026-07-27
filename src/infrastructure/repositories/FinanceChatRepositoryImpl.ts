import { createApiClientWithToken } from '@/src/infrastructure/api/apiClient';
import type { IFinanceChatRepository, ChatResponse } from '@/src/domain/repositories/IFinanceChatRepository';

export class FinanceChatRepositoryImpl implements IFinanceChatRepository {
  private api;

  constructor(token: string) {
    this.api = createApiClientWithToken(token);
  }

  async ask(companyId: string, question: string): Promise<ChatResponse> {
    const { data } = await this.api.post<ChatResponse>(`/finance-chat/ask/${companyId}`, {
      preguntaUsuario: question,
    });
    return data;
  }
}
