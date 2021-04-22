import { Box, Button, Container, Typography } from "@material-ui/core";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useState } from "react";
import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from "util/constants";
import * as yup from "yup";

const validationSchema = yup.object({
  confirmNewPassword: yup.string().oneOf([yup.ref("newPassword")], "Passwords must match"),
});

const ChangePassword = () => {
  const classes = useStyles();
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");

  return (
    <FullyCenteredLayout>
      <Formik
        validationSchema={validationSchema}
        initialValues={{ newPassword: "" }}
        onSubmit={async ({ newPassword }) => {
          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/change_password/`, {
            token: typeof router.query.token === "string" ? router.query.token : "",
            newPassword,
          });
          if (response.data.error) setTokenError(response.data.error);
          else router.push(LOGIN_PATH);
        }}
      >
        <Form>
          <Container component="main" maxWidth="sm">
            <Box className={classes.card}>
              <MyTextField placeholder="New Password" label="New Password" name="newPassword" type="password" />
              <MyTextField
                placeholder="Confirm New Password"
                label="Confirm New Password"
                name="confirmNewPassword"
                type="password"
              />
              <Button color="primary" variant="contained" type="submit">
                Change password
              </Button>
              {tokenError && (
                <>
                  <Typography color="error" variant="subtitle1">
                    {tokenError}
                  </Typography>
                  <Typography variant="subtitle1">
                    <MyLink href={FORGOT_PASSWORD_PATH}>Click here to get a new reset password email</MyLink>
                  </Typography>
                </>
              )}
            </Box>
          </Container>
        </Form>
      </Formik>
    </FullyCenteredLayout>
  );
};

export default ChangePassword;
