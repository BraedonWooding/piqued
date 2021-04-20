import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Link,
  makeStyles,
  Theme,
  Typography,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { FileCopyRounded } from "@material-ui/icons";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { TranscriptPicker } from "components/Elements/TranscriptPicker";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { ErrorMessage, Form, Formik } from "formik";
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
  const [loading, setLoading] = useState(false);

  const skipTranscript = () => {
    localStorage.removeItem(SCRAPED_PROGRAMS);
    localStorage.removeItem(SCRAPED_COURSES);
    localStorage.removeItem(SCRAPED_GROUPS);
  };

  useEffect(() => {
    localStorage.setItem(SCRAPED_PROGRAMS, JSON.stringify([]));
    localStorage.setItem(SCRAPED_COURSES, JSON.stringify([]));
    localStorage.setItem(SCRAPED_GROUPS, JSON.stringify([]));
  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ file: "" }}
        onSubmit={async (values, formikHelper) => {
          setLoading(true);
          formikHelper.setStatus({});
          try {
            const formData = new FormData();
            formData.append("transcript", selectedTranscript);
            var resp = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/transcript/upload/", formData);
            if (resp.data.error) {
              formikHelper.setStatus({
                httpErrorMessage:
                  "Sorry we don't have information on your program and/or courses, please manually enter them on the next page",
              });
            } else {
              localStorage.setItem(SCRAPED_PROGRAMS, JSON.stringify(resp.data.programs));
              localStorage.setItem(SCRAPED_COURSES, JSON.stringify(resp.data.courses));
              localStorage.setItem(SCRAPED_GROUPS, JSON.stringify(resp.data.groups));
            }
          } catch {
            setLoading(false);
            formikHelper.setStatus({ httpErrorMessage: "Invalid Transcript File" });
            return;
          }
          setLoading(false);
          router.push(MANUAL_DETAIL_INPUT_PATH);
        }}
      >
        {({ isSubmitting, status }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Avatar>
                  <FileCopyRounded />
                </Avatar>
                <Typography variant="h5">Upload Your Transcript</Typography>
                &nbsp;
                <Typography>
                  By uploading your UNSW Academic Transcript/Statement, we can recommend groups relevant to your study
                  to help you connect with your peers
                </Typography>
                &nbsp; &nbsp;
                <Grid container spacing={4}>
                  <Grid item xs={12} className={customClasses.centeredObject}>
                    <TranscriptPicker transcriptSelect={setTranscript} />
                    {status && status.httpErrorMessage && (
                      <div style={{ fontSize: 20 }} className={customClasses.error}>
                        {status.httpErrorMessage}
                      </div>
                    )}
                  </Grid>
                  <Grid item xs={12} className={customClasses.centeredObject}>
                    <div style={{ position: "relative" }}>
                      <Button type="submit" color="primary" variant="contained" disabled={loading || isSubmitting}>
                        Upload
                      </Button>
                      {loading && (
                        <CircularProgress
                          size={24}
                          style={{
                            color: green[500],
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            marginTop: -12,
                            marginLeft: -12,
                            zIndex: 1,
                          }}
                        />
                      )}
                    </div>
                  </Grid>
                  <Grid item xs={12}>
                    <Link
                      href={MANUAL_DETAIL_INPUT_PATH}
                      className={customClasses.centeredObject}
                      onClick={skipTranscript}
                    >
                      <Typography>Don't have a transcript on hand? Skip to manual input</Typography>
                    </Link>
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout>
  );
};

const createStyles = makeStyles((theme: Theme) => ({
  centeredObject: { display: "flex", justifyContent: "center" },
  error: { color: theme.palette.error.main },
}));

export default TranscriptUpload;
