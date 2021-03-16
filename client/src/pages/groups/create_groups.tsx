import { Avatar, Box, Button, Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { ChatBubbleOutline } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { NavButtonLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import React from "react";
import { SEARCH_GROUPS_PATH } from "util/constants";

const CreateGroup = () => {
  const classes = useStyles();
  const customClasses = createStyles();
  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ name: "", users: [] }}
        onSubmit={async (values) => {
          await axios.post("/api/groups", values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Avatar>
                  <ChatBubbleOutline />
                </Avatar>
                <Typography variant="h5">Create a new group</Typography>
                <MyTextField placeholder="Group Name" label="Group Name" name="name" autoFocus />
                <Grid container spacing={1} >
                  <Grid item xs={12} className={customClasses.interfaceButtons}>
                    <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                      Create Group
                    </Button>

                  </Grid>
                  <Grid item xs={12} className={customClasses.interfaceButtons}>
                    <NavButtonLink href={SEARCH_GROUPS_PATH} color="primary" variant="contained">
                      Cancel
                    </NavButtonLink>
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

const createStyles = makeStyles(() => ({
  interfaceButtons: { display: "flex", justifyContent: "center" },
}));

export default CreateGroup;
