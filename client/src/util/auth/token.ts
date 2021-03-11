import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "util/constants";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN);

export const setAccessToken = (value: string) => localStorage.setItem(ACCESS_TOKEN, value);

export const refreshAccessToken = async () => {
  const refresh_token = localStorage.getItem(REFRESH_TOKEN);
  const res = await axios.post("/api/token/refresh", { refresh_token });
  return res.data.access_token;
};
