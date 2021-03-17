import Chat from "components/Chat/Chat";
import { useGetUser } from "util/hooks/useGetUser";

const Home = () => {
  const user = useGetUser();

  if (!user) return <div></div>;

  return <Chat activeUser={user} />;
};

export default Home;
