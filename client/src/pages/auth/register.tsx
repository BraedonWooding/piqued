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
import React, { useState } from "react";
import FacebookLogin from 'react-facebook-login';
import { authenticateToken } from "util/auth/token";
import { lookupCurrentUser } from "util/auth/user";
import { LOGIN_PATH, UPLOAD_TRANSCRIPT_PATH } from "util/constants";
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
  const [FB_interests, setFBInterests] = useState<String[]>();

  const responseFacebook = (response, setFieldValue) => {
    setFieldValue("first_name", response["first_name"])
    setFieldValue("last_name", response["last_name"])
    setFieldValue("email", response["first_name"][0].toLowerCase() + "." + response["last_name"].toLowerCase() + "@student.unsw.edu.au")
    setFieldValue("date_of_birth", new Date(response["birthday"]))
    //birthday setFieldValue("email", response["first_name"][0].toLowerCase() + "." + response["last_name"].toLowerCase() + "@student.unsw.edu.au")

    var interest_names = [];
    for (var i = 0; i < response["likes"]["data"].length; i++) {
      interest_names.push(response["likes"]["data"][i]["name"]);
    }
    setFBInterests(interest_names)
  }

  return (
    <FullyCenteredLayout>
      <Formik
        initialValues={{
          first_name: "",
          last_name: "",
          date_of_birth: new Date(),
          email: "",
          password: "",
          confirmPassword: "",
        }}
        onSubmit={async ({ confirmPassword, ...other }) => {
          const { date_of_birth, email: username, } = other;
          await axios.post(process.env.NEXT_PUBLIC_API_URL + "/users/", {
            ...other,
            date_of_birth: format(date_of_birth, "yyyy-MM-dd"),
            username: username
          });
          await authenticateToken({ password: other.password, username });
          var usr = await lookupCurrentUser();
          await axios.post(process.env.NEXT_PUBLIC_API_URL + "/addInterests/", {
            interests: FB_interests,
            userId: usr["id"]
          });
          var usr = await lookupCurrentUser();
          //router.push("/user/details/init");
          //await lookupCurrentUser();
          router.push(UPLOAD_TRANSCRIPT_PATH);
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
                <FacebookLogin
                  appId={process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}
                  autoLoad={false}
                  fields="id,name,birthday,first_name,last_name,likes{name,id,link}"
                  scope="user_birthday, user_likes"
                  callback={data => responseFacebook(data, setFieldValue)} />
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <MyTextField placeholder="First Name" value={values.first_name} label="First Name" name="first_name" autoFocus />
                  </Grid>
                  <Grid item xs={6}>
                    <MyTextField placeholder="Last Name" value={values.last_name} label="Last Name" name="last_name" />
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
                <MyTextField placeholder="UNSW Email" value={values.email} label="UNSW Email" name="email" />
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
