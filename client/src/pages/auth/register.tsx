import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { Layout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { LOGIN_PATH } from "util/constants";
import * as yup from "yup";

const validationSchema = yup.object({
  email: yup.string().email(),
  username: yup
    .string()
    .matches(
      /^(?=[a-zA-Z0-9._]{1,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
      "Input Username and Submit [Max 20 characters that can contain alphanumeric, underscore and dot]"
    ),
  password: yup
    .string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/,
      "Input Password and Submit [8 to 20 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character]"
    ),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match"),
});

const Register = () => {
  const classes = useStyles();
  return (
    <Layout>
      <Formik
        initialValues={{
          email: "",
          username: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async ({ email, username, password }, { setErrors }) => {}}
      >
        {({ isSubmitting }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Avatar>
                  <LockOutlined color="secondary" />
                </Avatar>
                <Typography variant="h5">Register</Typography>
                <MyTextField placeholder="Email" label="Email" name="email" autoFocus />
                <MyTextField placeholder="Username" label="Username" name="username" />
                <MyTextField placeholder="Password" label="Password" name="password" type="password" />
                <MyTextField
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                />
                &nbsp;
                <Button color="primary" variant="contained" disabled={isSubmitting}>
                  Sign up
                </Button>
                &nbsp;
                <Grid container>
                  <Grid item>
                    <Typography variant="subtitle1">
                      <MyLink href={LOGIN_PATH}>Already have an account? Login</MyLink>
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

export default Register;
