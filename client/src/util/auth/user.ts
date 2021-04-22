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
};

export const lookupUser = async (user: "self" | number) => {
  try {
    const res = await axios.get(process.env.NEXT_PUBLIC_API_URL + `/users/${user}/`);
    return res.data as User;
  } catch {
    return null;
  }
};

export const lookupCurrentUser = async () => {
  const user = await lookupUser("self");
  if (user) {
    setUser(user);
    return user;
  } else {
    window.location = LOGIN_PATH;
  }
};
