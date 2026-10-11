import axios from 'axios';
import { getBackendUrl } from '../config/apiConfig';

const axiosClient = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    // Dynamically assign active baseURL on each request
    config.baseURL = getBackendUrl();

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response) => {
    // Guard against Vercel/proxies returning index.html for unmapped /api routes
    if (
      typeof response.data === 'string' &&
      (response.data.trim().startsWith('<!DOCTYPE') ||
        response.data.trim().startsWith('<html') ||
        response.headers['content-type']?.includes('text/html'))
    ) {
      const err = new Error('Backend server is offline or returned an HTML fallback page.');
      err.response = {
        status: 404,
        data: { message: 'Backend API not reachable (Received HTML instead of JSON).' },
      };
      return Promise.reject(err);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and has token, clear expired token
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
