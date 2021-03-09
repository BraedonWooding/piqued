import { Typography } from "@material-ui/core";
import { NavButtonLink } from "components/Common/Link";
import { Layout } from "components/Layout/Layout";
import { HOME_PATH, LOGIN_PATH, REGISTER_PATH } from "util/constants";

const Index = () => (
  <Layout>
    <img src="/favicon.ico" alt="logo" width={250} height={200} />
    <Typography>Making YourUNSW a little bit less lonely~</Typography>
    &nbsp;
    <NavButtonLink href={LOGIN_PATH} color="primary" variant="contained">
      Login
    </NavButtonLink>
    &nbsp;
    <NavButtonLink href={REGISTER_PATH} color="primary" variant="contained">
      Sign up
    </NavButtonLink>
    &nbsp;
    <NavButtonLink href={HOME_PATH} color="primary" variant="contained">
      Chat (-REMOVE FROM PRODUCTION)
    </NavButtonLink>
  </Layout>
);

export default Index;
