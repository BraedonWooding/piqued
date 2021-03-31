import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { authenticateToken } from "util/auth/token";
import { lookupCurrentUser } from "util/auth/user";
import { FORGOT_PASSWORD_PATH, REGISTER_PATH } from "util/constants";

const Login = () => {
  const classes = useStyles();
  const router = useRouter();
  return (
    <FullyCenteredLayout>
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          try {
            await authenticateToken(values);
            await lookupCurrentUser();
            router.push("/home");
          } catch (e) {
            setSubmitting(false);
            setErrors({
              username: "Invalid Username or Password",
              password: "Invalid Username or Password",
            });
          }
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
                  <Grid item xs={6}>
                    <Typography variant="subtitle1">
                      <MyLink href={FORGOT_PASSWORD_PATH}>Forgot password?</MyLink>
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
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
    </FullyCenteredLayout>
  );
};

export default Login;
