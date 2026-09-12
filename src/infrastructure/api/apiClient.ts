import axios, { type AxiosError } from 'axios';
import { API_BASE_URL } from '@/src/shared/constants';

function rejectWithError(error: AxiosError): Promise<never> {
  if (!error.response) {
    return Promise.reject(new Error('Error de conexión con el servidor'));
  }

  const { status, data } = error.response;
  const serverData = data as { message?: string | string[] } | undefined;

  if (status === 401) {
    return Promise.reject(new Error('No autorizado'));
  }

  if (status >= 400 && status < 500) {
    const raw = serverData?.message;
    const message = Array.isArray(raw) ? raw.join('. ') : raw || 'Datos inválidos';
    return Promise.reject(new Error(message));
  }

  return Promise.reject(new Error('Error del servidor'));
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => rejectWithError(error)
);

export function createApiClientWithToken(token: string) {
  const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
  });

  client.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => rejectWithError(error)
  );

  return client;
}

export default apiClient;
