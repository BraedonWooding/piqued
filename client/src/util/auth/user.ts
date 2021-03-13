import axios from "axios";
import { USER } from "util/constants"
import { User } from "../../types";



export const getUser = () => JSON.parse(localStorage.getItem(USER)) as User

export const popUser = () => {
  var tmp = getUser();
  localStorage.removeItem(USER);
  return tmp;
}

export const setUser = (user: User) => localStorage.setItem(USER, JSON.stringify(user));

export const lookupCurrentUser = async () => {
  const res = await axios.get("/api/users/self");
  setUser(res.data);
};
