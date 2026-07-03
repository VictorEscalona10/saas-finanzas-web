export interface ChatRequest {
  preguntaUsuario: string;
}

export interface ChatResponse {
  response: string;
}

export interface IFinanceChatRepository {
  ask(companyId: string, question: string): Promise<ChatResponse>;
}
