import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { Layout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { FORGOT_PASSWORD_PATH, REGISTER_PATH } from "util/constants";

const Login = () => {
  const classes = useStyles();
  return (
    <Layout>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values) => {
          const response = await axios.post("/api/token", values);
          console.log(response);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Avatar>
                  <LockOutlined />
                </Avatar>
                <Typography variant="h5">Login</Typography>
                <MyTextField placeholder="UNSW Email" label="UNSW Email" name="username" autoFocus />
                <MyTextField placeholder="Password" label="Password" name="password" type="password" />
                &nbsp;
                <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                  Sign in
                </Button>
                &nbsp;
                <Grid container spacing={4}>
                  <Grid item xs>
                    <Typography variant="subtitle1">
                      <MyLink href={FORGOT_PASSWORD_PATH}>Forgot password?</MyLink>
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Typography variant="subtitle1">
                      <MyLink href={REGISTER_PATH}>Don't have an account? Register</MyLink>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default Login;
