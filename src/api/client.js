import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const api = axios.create({ baseURL: API_URL });

// Token store-dan oxunur; store bu modulu import etdiyi üçün dairəvi asılılığın qarşısını almaq məqsədilə
// getter və 401 handler sonradan qoşulur (setupApi).
let getToken = () => null;
let onUnauthorized = () => {};

export function setupApi({ tokenGetter, unauthorizedHandler }) {
  getToken = tokenGetter;
  onUnauthorized = unauthorizedHandler;
}

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Qorunan sorğuda token etibarsızdırsa, istifadəçini çıxışa yönləndir
    if (error.response?.status === 401 && error.config?.headers?.Authorization) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export const errorMessage = (error, fallback = "Xəta baş verdi") =>
  error?.response?.data?.message || error?.message || fallback;

export default api;
