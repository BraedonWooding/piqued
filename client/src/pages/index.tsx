import { NavButtonLink } from "components/Common/Link";
import { Layout } from "components/Layout/Layout";
import { LOGIN_PATH, REGISTER_PATH } from "util/constants";

const Index = () => (
  <Layout>
    <NavButtonLink href={LOGIN_PATH} color="primary" variant="contained">
      Login
    </NavButtonLink>
    &nbsp;
    <NavButtonLink href={REGISTER_PATH} color="primary" variant="contained">
      Sign up
    </NavButtonLink>
  </Layout>
);

export default Index;
