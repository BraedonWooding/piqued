import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { SearchTwoTone } from "@material-ui/icons";
import { useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import React, { useEffect } from "react";
import { lookupCurrentUser, setUser } from "util/auth/user";
import { DISCOVER_GROUPS_PATH, DISCOVER_INTERESTS_PATH, HOME_PATH } from "util/constants";

const Discover = () => {
  const formikClasses = useStyles();

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));
  }, []);

  return (
    <HorizontallyCenteredLayout>

      <Container component="main" maxWidth="sm" style={{ display: "flex", justifyContent: "center" }}>
        <Box className={formikClasses.card} >
          <Avatar>
            <SearchTwoTone />
          </Avatar>
          <Typography variant="h5">
            Discover
          </Typography>
          &nbsp;
          <Typography>
            Looking to branch out? Click below to expand your interests or find new groups to join
          </Typography>
          &nbsp;
          <Grid container>
            <Grid item xs={6} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                color="primary"
                variant="contained"
                href={DISCOVER_GROUPS_PATH}>
                Groups
              </Button>
            </Grid>
            <Grid item xs={6} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                color="primary"
                variant="contained"
                href={DISCOVER_INTERESTS_PATH}>
                Interests
              </Button>
            </Grid>
            &nbsp;
            <Grid item xs={12} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <MyLink href={HOME_PATH}>
                <Typography>
                  Cancel
                </Typography>
              </MyLink>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </HorizontallyCenteredLayout >
  );
};

export default Discover;