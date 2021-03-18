import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "types";
import { getUser, lookupCurrentUser } from "util/auth/user";
import { LOGIN_PATH } from "util/constants";

export const useGetUser = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    lookupCurrentUser()
      .then(() => {
        const user = getUser();
        if (!user) router.push(LOGIN_PATH);
        setUser(user);
      })
      .catch(() => router.push(LOGIN_PATH));
  }, []);

  return user;
};
