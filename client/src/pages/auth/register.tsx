import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { KeyboardDatePicker } from "@material-ui/pickers";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { format } from "date-fns";
import { Field, Form, Formik } from "formik";
import { LOGIN_PATH } from "util/constants";
import * as yup from "yup";

const validationSchema = yup.object({
  first_name: yup
    .string()
    .matches(
      /^(?=[a-zA-Z0-9._]{1,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
      "Input Username and Submit [Max 20 characters that can contain alphanumeric, underscore and dot]"
    ),
  last_name: yup
    .string()
    .matches(
      /^(?=[a-zA-Z0-9._]{1,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
      "Input Username and Submit [Max 20 characters that can contain alphanumeric, underscore and dot]"
    ),
  date_of_birth: yup.date(),
  email: yup.string().email(),
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
        validationSchema={validationSchema}
        onSubmit={async ({ confirmPassword, ...other }) => {
          const { date_of_birth, email: username } = other;
          await axios.post("/api/users", { ...other, date_of_birth: format(date_of_birth, "yyyy-MM-dd"), username });
        }}
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
