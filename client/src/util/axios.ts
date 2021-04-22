import axios from "axios";
import { deleteToken } from "../firebase";
import { getToken, refreshAccessToken } from "./auth/token";
import { LOGIN_PATH } from "./constants";

axios.interceptors.request.use(
  async (ctx) => {
    const token = getToken();
    if (token && token.access && ctx?.url?.includes(process.env.NEXT_PUBLIC_API_URL))
      ctx.headers.Authorization = `Bearer ${token.access}`;
    return ctx;
  },
  (err) => Promise.reject(err)
);

axios.interceptors.response.use(
  (resp) => resp,
  async (err) => {
    const originalRequest = err.config;
    if ([401, 403].includes(err.response?.status)) {
      try {
        await refreshAccessToken();
        return axios(originalRequest);
      } catch {
        // any failure we go back to login
        // We need to handle rudimentary logout behaviour such as removing FCM tokens
        const res = await deleteToken();
        if (!res) {
          console.log("Token deletion unsuccessful")
        }
        if (typeof window === 'undefined') return;
        if (window.location.pathname !== LOGIN_PATH) window.location.replace(LOGIN_PATH);
      }
    } else {
      throw err;
    }
  }
);
