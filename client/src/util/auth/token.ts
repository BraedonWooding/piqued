import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "util/constants";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN);

export const setAccessToken = (value: string) => localStorage.setItem(ACCESS_TOKEN, value);

export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN);

export const setRefreshToken = (value: string) => localStorage.setItem(REFRESH_TOKEN, value);

export const removeRefreshToken = () => localStorage.removeItem(REFRESH_TOKEN);

export const refreshAccessToken: () => Promise<string | null> = async () => {
  const res = await axios.post("/api/token/refresh", { refresh_token: getRefreshToken() });
  return res.data.access_token;
};
