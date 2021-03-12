import Chat from "components/Chat/Chat";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const { group } = router.query;
  const groupId = Number(group);

  if (!groupId) return null;

  return <Chat activeUserId={0} activeUsername={"God"} groupId={groupId} groupName={"Hell"} />;
};

export default Home;
