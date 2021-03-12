import axios from "axios";
import { getAccessToken, getRefreshToken, refreshAccessToken, removeRefreshToken, setAccessToken } from "./auth/token";
import { LOGIN_PATH } from "./constants";

axios.interceptors.request.use(async (ctx) => {
  const accessToken = getAccessToken();
  console.log(accessToken);
  if (accessToken) ctx.headers.Authorization = `Bearer ${accessToken}`;
  return ctx;
});

axios.interceptors.response.use(undefined, async (err) => {
  const originalRequest = err.config;
  if (err.response?.status === 401 && getRefreshToken()) {
    const accessToken = await refreshAccessToken();
    if (accessToken) {
      setAccessToken(accessToken);
      axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
      removeRefreshToken();
      return axios.post(originalRequest);
    } else window.location.href = LOGIN_PATH;
  } else window.location.href = LOGIN_PATH;
  return Promise.reject(err);
});
