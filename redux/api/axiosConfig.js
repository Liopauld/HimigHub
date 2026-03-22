import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { getToken, deleteToken } from '../../db/sqlite';

const API_PORT = 5000;

const isLocalHost = (host) => {
  if (!host) return false;
  return (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('10.') ||
    host.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
};

const sanitizeApiUrl = (rawUrl) => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;

  try {
    const parsed = new URL(withScheme);
    // Local development backends are typically plain HTTP.
    if (parsed.protocol === 'https:' && isLocalHost(parsed.hostname)) {
      parsed.protocol = 'http:';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return withScheme.replace(/\/$/, '');
  }
};

const normalizeHost = (value) => {
  if (!value) return null;
  return value.replace(/^https?:\/\//, '').split(':')[0];
};

const getExpoHost = () => {
  // Covers modern Expo manifests plus older debuggerHost shapes.
  const hostFromExpoConfig = normalizeHost(Constants?.expoConfig?.hostUri);
  const hostFromManifest2 = normalizeHost(
    Constants?.manifest2?.extra?.expoGo?.debuggerHost
  );
  const hostFromManifest = normalizeHost(Constants?.manifest?.debuggerHost);
  return hostFromExpoConfig || hostFromManifest2 || hostFromManifest || null;
};

const buildDefaultBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) return sanitizeApiUrl(envUrl);

  const expoHost = getExpoHost();
  if (expoHost) return sanitizeApiUrl(`http://${expoHost}:${API_PORT}/api`);

  // Final fallback when host can't be inferred.
  return sanitizeApiUrl(Platform.OS === 'android'
    ? `http://10.0.2.2:${API_PORT}/api`
    : `http://localhost:${API_PORT}/api`);
};

export const BASE_URL = buildDefaultBaseUrl();

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

let store;
export const injectStore = (_store) => {
  store = _store;
};

// Request interceptor
api.interceptors.request.use(async (config) => {
  const isFormData =
    (typeof FormData !== 'undefined' && config.data instanceof FormData) ||
    (config.data && typeof config.data === 'object' && Array.isArray(config.data._parts));

  if (isFormData && config.headers) {
    // Let axios/runtime set proper multipart boundary automatically.
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }

  const dbToken = await getToken();
  const stateToken = store?.getState?.()?.auth?.token;
  const token = dbToken || stateToken;

  if (typeof token === 'string' && token.trim()) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.code === 'ECONNABORTED') {
      return Promise.reject(new Error(`Request timeout while connecting to ${BASE_URL}`));
    }

    if (!err.response) {
      const isCloudEndpoint = /^https?:\/\//i.test(BASE_URL) && !isLocalHost(new URL(BASE_URL).hostname);
      const message = isCloudEndpoint
        ? `Cannot reach backend at ${BASE_URL}. Check internet access and verify the deployed service is healthy.`
        : `Cannot reach backend at ${BASE_URL}. Ensure backend is running on port ${API_PORT} and phone/emulator is on the same network.`;
      return Promise.reject(new Error(message));
    }

    if (err.response?.status === 401) {
      await deleteToken();
      if (store) {
        // Dispatch by action type to avoid authSlice <-> axiosConfig import cycle.
        store.dispatch({ type: 'auth/logout' });
      }
    }
    return Promise.reject(err);
  }
);

export default api;
