import axios from "axios";
import { getToken, setToken, popToken, refreshAccessToken } from "./auth/token";
import { LOGIN_PATH } from "./constants";
import { useRouter } from "next/router";

axios.interceptors.request.use(async (ctx) => {
  const token = getToken();
  if (token && token.access) ctx.headers.Authorization = `Bearer ${token.access}`;
  return ctx;
}, (err) => Promise.reject(err));

axios.interceptors.response.use((resp) => resp, async (err) => {
  const originalRequest = err.config;
  if (err.response?.status in [401, 403]) {
    try {
      await refreshAccessToken();
      return axios(originalRequest);
    } catch {
      // any failure we go back to login
      const router = useRouter();
      router.push(LOGIN_PATH);
    }
  } else {
    throw err;
  }
});
