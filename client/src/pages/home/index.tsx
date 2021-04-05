import Chat from "components/Chat/Chat";
import { useGetUser } from "util/hooks/useGetUser";
import { setupForegroundHandling, addToken } from '../../firebase'

const Home = () => {
  const user = useGetUser();

  if (!user) return <div></div>;

  setupForegroundHandling();
  addToken(); // On page load, we want the token to be sent to the database
  
  return <Chat activeUser={user} />;
};

export default Home;
