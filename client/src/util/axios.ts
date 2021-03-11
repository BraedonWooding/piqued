import axios from "axios";
import { getAccessToken, refreshAccessToken, setAccessToken } from "./auth/token";

axios.interceptors.request.use(async (ctx) => {
  const accessToken = getAccessToken();
  if (accessToken) ctx.headers.Authorization = `Bearer ${accessToken}`;
  return ctx;
});

axios.interceptors.response.use(undefined, async (err) => {
  const originalRequest = err.config;
  if (err.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true;
    const accessToken = await refreshAccessToken();
    setAccessToken(accessToken);
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    return axios.post(originalRequest);
  }
  return Promise.reject(err);
});
