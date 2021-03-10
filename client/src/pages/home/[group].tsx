import Chat from "components/Chat/Chat";
import { Layout } from "components/Layout/Layout";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const { group } = router.query;
  const groupId = Number(group);

  if (!groupId) return null;

  return (
    <Layout>
      <Chat activeUser={0} groupId={groupId} />
    </Layout>
  );
};

export default Home;
