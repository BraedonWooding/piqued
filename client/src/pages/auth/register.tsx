import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { KeyboardDatePicker } from "@material-ui/pickers";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { format } from "date-fns";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { authenticateToken } from "util/auth/token";
import { lookupCurrentUser } from "util/auth/user";
import { LOGIN_PATH } from "util/constants";
import * as yup from "yup";

const validationSchema = yup.object({
  date_of_birth: yup.date(),
  email: yup
    .string()
    .email()
    .matches(
      /^.*\@(?:student.|ad.)?unsw.edu.au$/,
      "Email has to end with @ad.unsw.edu.au, @student.unsw.edu.au, or @unsw.edu.au"
    ),
  confirmPassword: yup.string().oneOf([yup.ref("password")], "Passwords must match"),
});

const Register = () => {
  const classes = useStyles();
  const router = useRouter();

  return (
    <FullyCenteredLayout>
      <Formik
        initialValues={{
          first_name: "",
          last_name: "",
          date_of_birth: new Date(),
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        }}
        onSubmit={async ({ confirmPassword, ...other }) => {
          const { date_of_birth, email: username } = other;
          await axios.post(process.env.NEXT_PUBLIC_API_URL + "/users/", {
            ...other,
            date_of_birth: format(date_of_birth, "yyyy-MM-dd"),
            username,
          });
          await authenticateToken({ password: other.password, username });
          await lookupCurrentUser();
          router.push("/user/details/init");
        }}
        validationSchema={validationSchema}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Avatar>
                  <LockOutlined color="secondary" />
                </Avatar>
                <Typography variant="h5">Register</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <MyTextField placeholder="First Name" label="First Name" name="first_name" autoFocus />
                  </Grid>
                  <Grid item xs={6}>
                    <MyTextField placeholder="Last Name" label="Last Name" name="last_name" />
                  </Grid>
                </Grid>
                <Field
                  component={KeyboardDatePicker}
                  placeholder="Date of Birth"
                  label="Date of Birth"
                  name="date_of_birth"
                  format="dd/MM/yyyy"
                  value={values.date_of_birth}
                  onChange={(value: Date) => setFieldValue("date_of_birth", value)}
                />
                <MyTextField placeholder="UNSW Email" label="UNSW Email" name="email" />
                <MyTextField placeholder="Password" label="Password" name="password" type="password" />
                <MyTextField
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                />
                &nbsp;
                <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                  Sign up
                </Button>
                &nbsp;
                <Typography variant="subtitle1">
                  <MyLink href={LOGIN_PATH}>Already have an account? Login</MyLink>
                </Typography>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </FullyCenteredLayout>
  );
};

export default Register;
