import { Avatar, Box, Button, Container, Grid, Link, makeStyles, Theme, Typography } from "@material-ui/core";
import { FileCopyRounded } from "@material-ui/icons";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { TranscriptPicker } from "components/Elements/TranscriptPicker";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { User } from "types";
import { lookupCurrentUser } from "util/auth/user";
import { MANUAL_DETAIL_INPUT_PATH, SCRAPED_COURSES, SCRAPED_GROUPS, SCRAPED_PROGRAMS } from "util/constants";

// add props for return link

const TranscriptUpload = () => {

  const classes = useStyles();
  const customClasses = createStyles();
  const [selectedTranscript, setTranscript] = useState<File>(null);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const skipTranscript = () => {
    localStorage.removeItem(SCRAPED_PROGRAMS)
    localStorage.removeItem(SCRAPED_COURSES);
    localStorage.removeItem(SCRAPED_GROUPS);
  }


  useEffect(() => {
    localStorage.setItem(SCRAPED_PROGRAMS, JSON.stringify([]));
    localStorage.setItem(SCRAPED_COURSES, JSON.stringify([]));
    localStorage.setItem(SCRAPED_GROUPS, JSON.stringify([]))
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
          var resp = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/transcript/upload/", formData);
          localStorage.setItem(SCRAPED_PROGRAMS, JSON.stringify(resp.data.programs));
          localStorage.setItem(SCRAPED_COURSES, JSON.stringify(resp.data.courses));
          localStorage.setItem(SCRAPED_GROUPS, JSON.stringify(resp.data.groups))
          router.push(MANUAL_DETAIL_INPUT_PATH);
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
                <Typography>
                  By uploading your UNSW Academic Transcript/Statement,
                  we can recommend groups relevant to your study to help
                  you connect with your peers
                </Typography>
                &nbsp;
                &nbsp;
                <Grid container spacing={4}>
                  <Grid item xs={12} className={customClasses.centeredObject}>
                    <TranscriptPicker transcriptSelect={setTranscript} />
                  </Grid>
                  <Grid item xs={12} className={customClasses.centeredObject}>
                    <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                      Upload
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Link href={MANUAL_DETAIL_INPUT_PATH} className={customClasses.centeredObject} onClick={skipTranscript}>
                      <Typography>
                        Don't have a transcript on hand? Skip to manual input
                      </Typography>
                    </Link>
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
  centeredObject: { display: "flex", justifyContent: "center" },
  error: { color: theme.palette.error.main },
}));

export default TranscriptUpload;
