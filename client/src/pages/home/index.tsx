import Chat from "components/Chat/Chat";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getUser, lookupCurrentUser } from "util/auth/user";
import { User } from "types";

const Home = () => {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        lookupCurrentUser().then(() => {
            const user = getUser();
            if (!user) {
                router.push("/auth/login");
            }
            setUser(user);
        }).catch(() => router.push("/auth/login"));
    }, []);

    if (!user) return (<div></div>);

    return <Chat activeUser={user} />;
};

export default Home;
