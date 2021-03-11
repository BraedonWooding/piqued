import axios from "axios";
import { ACCESS_TOKEN } from "util/constants";

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN);

export const setAccessToken = (value: string) => localStorage.setItem(ACCESS_TOKEN, value);

export const refreshAccessToken = async () => {
  const token = localStorage.getItem("refreshToken");
  const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/token/refresh`, { refresh: token });
  return res.data.access_token;
};
