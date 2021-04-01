import { Avatar, Box, Button, Container, Grid, makeStyles, Theme, Typography } from "@material-ui/core";
import { FileCopyRounded } from "@material-ui/icons";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { NavButtonLink } from "components/Common/Link";
import { TranscriptPicker } from "components/Elements/TranscriptPicker";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { User } from "types";
import { lookupCurrentUser } from "util/auth/user";
import { HOME_PATH } from "util/constants";

const TranscriptUpload = () => {

  const classes = useStyles();
  const customClasses = createStyles();
  const [selectedTranscript, setTranscript] = useState<File>(null);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));
  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{}}
        onSubmit={async () => {
          const formData = new FormData();
          formData.append("transcript", selectedTranscript);
          await axios.post(process.env.NEXT_PUBLIC_API_URL + "/transcript/upload/", formData);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Avatar>
                  <FileCopyRounded />
                </Avatar>
                <Typography variant="h5">Upload Your Transcript</Typography>
                &nbsp;
                <TranscriptPicker transcriptSelect={setTranscript} />
                &nbsp;
                <Grid container spacing={1}>
                  <Grid item xs={12} className={customClasses.interfaceButtons}>
                    <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                      Upload
                    </Button>
                  </Grid>
                  <Grid item xs={12} className={customClasses.interfaceButtons}>
                    <NavButtonLink href={HOME_PATH} color="primary" variant="contained">
                      Cancel
                    </NavButtonLink>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout >
  );
};

const createStyles = makeStyles((theme: Theme) => ({
  interfaceButtons: { display: "flex", justifyContent: "center" },
  error: { color: theme.palette.error.main },
}));

export default TranscriptUpload;
