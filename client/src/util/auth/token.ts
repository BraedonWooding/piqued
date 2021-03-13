import axios from "axios";
import { TOKEN } from "util/constants";

export interface Token {
  access: string;
  refresh: string;
}

export const getToken = () => JSON.parse(localStorage.getItem(TOKEN)) as Token

export const popToken = () => {
  var tmp = getToken();
  localStorage.removeItem(TOKEN);
  return tmp;
}

export const setToken = (tok: Token) => localStorage.setItem(TOKEN, JSON.stringify(tok));

export const refreshAccessToken = async () => {
  const res = await axios.post("/api/token/refresh", { refresh_token: popToken().refresh });
  setToken(res.data);
};

export const authenticateToken = async(details: {username: string, password: string}) => {
  const res = await axios.post("/api/token", details);
  setToken(res.data);
};
