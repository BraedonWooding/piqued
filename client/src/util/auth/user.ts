import axios from "axios";
import { useRouter } from "next/router";
import { User } from "types";
import { LOGIN_PATH, USER } from "util/constants";

export const getUser = () => JSON.parse(localStorage.getItem(USER)) as User;

export const popUser = () => {
  const tmp = getUser();
  localStorage.removeItem(USER);
  return tmp;
};

export const setUser = (user: User) => {
  localStorage.setItem(USER, JSON.stringify(user));
}

export const lookupCurrentUser = async () => {
  try {
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/users/self/");
    setUser(res.data);
    return res.data;
  } catch {
    useRouter().push(LOGIN_PATH);
  }
};
