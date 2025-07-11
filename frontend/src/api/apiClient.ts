import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { toast } from 'react-toastify';

// Interface pour la configuration personnalisée
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// Créer une instance Axios configurée
const apiClient: AxiosInstance = axios.create({
  baseURL: 'http://localhost:7000/api',  // Accès direct à l'API Gateway
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur de requête
apiClient.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    // Les cookies sont envoyés automatiquement grâce à withCredentials
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`📥 Response ${response.status}:`, response.config.url);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Si 401 et pas déjà une tentative de refresh et pas sur login
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;

      try {
        // Tenter de rafraîchir le token
        await apiClient.post('/auth/refresh');
        // Réessayer la requête originale
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Rediriger vers login si refresh échoue
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Afficher les erreurs sauf pour validate
    if (!error.config?.url?.includes('/auth/validate')) {
      const message = (error.response?.data as any)?.message || 'Une erreur est survenue';
      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
