import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "types";
import { getUser, lookupCurrentUser } from "util/auth/user";

export const useGetUser = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    lookupCurrentUser()
      .then(() => {
        const user = getUser();
        if (!user) router.push("/auth/login");
        setUser(user);
      })
      .catch(() => router.push("/auth/login"));
  }, []);

  return user;
};
