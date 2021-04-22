import { Box, Button, Container, Typography } from "@material-ui/core";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useState } from "react";

const ForgotPassword = () => {
  const classes = useStyles();
  const [complete, setComplete] = useState(false);

  return (
    <FullyCenteredLayout>
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/forgot_password/`, values);
          setComplete(true);
        }}
      >
        <Form>
          <Container component="main" maxWidth="sm">
            <Box className={classes.card}>
              <Typography variant="h4">Reset password</Typography>
              <MyTextField placeholder="Email" label="Email" name="email" autoFocus />
              <Button color="primary" variant="contained" type="submit">
                Send Email Reset
              </Button>
              {complete && (
                <Typography>
                  If an account with that email exists, we sent you an email that is linked with it.
                </Typography>
              )}
            </Box>
          </Container>
        </Form>
      </Formik>
    </FullyCenteredLayout>
  );
};

export default ForgotPassword;
