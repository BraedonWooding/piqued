import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { LockOutlined } from "@material-ui/icons";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { Layout } from "components/Layout/Layout";
import { Field, Form, Formik } from "formik";
import { LOGIN_PATH } from "util/constants";
import * as yup from "yup";

const validationSchema = yup.object({
  firstName: yup
    .string()
    .matches(
      /^(?=[a-zA-Z0-9._]{1,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
      "Input Username and Submit [Max 20 characters that can contain alphanumeric, underscore and dot]"
    ),
  lastName: yup
    .string()
    .matches(
      /^(?=[a-zA-Z0-9._]{1,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/,
      "Input Username and Submit [Max 20 characters that can contain alphanumeric, underscore and dot]"
    ),
  dateOfBirth: yup.date(),
  UNSWEmail: yup.string().email(),
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
          firstName: "",
          lastName: "",
          dateOfBirth: new Date(),
          UNSWEmail: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={async ({ firstName, lastName, password }, { setErrors }) => {}}
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
                    <MyTextField placeholder="First Name" label="First Name" name="firstName" autoFocus />
                  </Grid>
                  <Grid item xs={6}>
                    <MyTextField placeholder="Last Name" label="Last Name" name="lastName" />
                  </Grid>
                </Grid>
                <Field
                  component={KeyboardDatePicker}
                  placeholder="Date of Birth"
                  label="Date of Birth"
                  name="dateOfBirth"
                  format="dd/MM/yyyy"
                  value={values.dateOfBirth}
                  onChange={(value: Date) => setFieldValue("dateOfBirth", value)}
                />
                <MyTextField placeholder="UNSW Email" label="UNSW Email" name="UNSWEmail" />
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
                <Typography variant="subtitle1">
                  <MyLink href={LOGIN_PATH}>Already have an account? Login</MyLink>
                </Typography>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default Register;
