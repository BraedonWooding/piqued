import { Avatar, Box, Button, Container, Grid, makeStyles, Theme, Typography } from "@material-ui/core";
import { ChatBubbleOutline } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { NavButtonLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import router from "next/router";
import { useEffect, useState } from "react";
import { User } from "types";
import { getUser, lookupCurrentUser } from "util/auth/user";
import { SEARCH_GROUPS_PATH } from "util/constants";

const CreateGroup = () => {
  const classes = useStyles();
  const customClasses = createStyles();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    lookupCurrentUser()
      .then(() => {
        const user = getUser();
        if (!user) router.push("/auth/login");
        setUser(user);
      })
      .catch(() => router.push("/auth/login"));
  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ name: "" }}
        onSubmit={async (values) => {
          await axios.post("/api/groups", values);
          setUser(await lookupCurrentUser());
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
                <Grid container spacing={1}>
                  <Grid item xs={12} className={customClasses.interfaceButtons}>
                    {user?.groups.map((group) => group.creator === user.username).length >= 3 ? (
                      <Box textAlign="center" flexDirection="column">
                        <Button type="submit" color="primary" variant="contained" disabled>
                          Create Group
                        </Button>
                        <Typography className={customClasses.error}>
                          You have reached the limit of creating 3 groups.
                        </Typography>
                      </Box>
                    ) : (
                      <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                        Create Group
                      </Button>
                    )}
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

const createStyles = makeStyles((theme: Theme) => ({
  interfaceButtons: { display: "flex", justifyContent: "center" },
  error: { color: theme.palette.error.main },
}));

export default CreateGroup;
