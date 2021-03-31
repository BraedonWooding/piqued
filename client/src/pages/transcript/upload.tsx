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

const uploadFiles = async () => {
  const urls: String[] = [];
  const formData = new FormData();
  // formData.append("file", selectedFiles[i]);
  // formData.append("name", currentGroup.name);
  const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/upload/", formData);
  // urls.push(response.data["url"]);
  // Only handle single files for now
  if (urls.length === 1) {
    return urls[0];
  }
  return "";
};

const validateFile = (file: File) => {
  // If we want to do some valid type processing here
  const validTypes = [""];
  if (validTypes.indexOf(file.type) === -1) {
    return false;
  }
  return true;
};

const TranscriptUpload = () => {
  const classes = useStyles();
  const customClasses = createStyles();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));
  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ name: "" }}
        onSubmit={async (values) => {
          await axios.post(process.env.NEXT_PUBLIC_API_URL + "/groups/", values);
          // router.push(HOME_PATH);
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
                <TranscriptPicker />
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
