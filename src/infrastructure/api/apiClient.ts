import axios from 'axios';
import { API_BASE_URL } from '@/src/shared/constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      return Promise.reject(new Error('Error de conexión con el servidor'));
    }
    return Promise.reject(error);
  }
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
    (error) => {
      if (!error.response) {
        return Promise.reject(new Error('Error de conexión con el servidor'));
      }
      return Promise.reject(error);
    }
  );

  return client;
}

export default apiClient;
