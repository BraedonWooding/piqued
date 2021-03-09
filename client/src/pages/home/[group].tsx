import Chat from "components/Chat";
import { Layout } from "components/Layout/Layout";
import { useRouter } from 'next/router';
import React from 'react';

const Home = () => {
  const router = useRouter();
  const { group } = router.query;
  var groupId = Number(group);

  // Avoid the issue of 'getInitialProps' passing in an invalid group ID
  if (!groupId) {
    return null;
  }

  // Loads the 'main' group screen template
  var userId = 0;
  return(
  <Layout>
    <Chat activeUser={userId} groupId={groupId}/>
  </Layout>
  );
};

export default Home;

