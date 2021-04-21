import { Avatar, Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { CloseOutlined, SearchTwoTone } from "@material-ui/icons";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import DiscoverGroups from "components/Elements/DiscoverGroups";
import { DiscoverInterests } from "components/Elements/DiscoverInterests";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import React, { useEffect, useState } from "react";
import { getUser, lookupCurrentUser, setUser } from "util/auth/user";
import { HOME_PATH } from "util/constants";

const Discover = () => {
  const formikClasses = useStyles();
  const [popularInterests, setPopularInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [interests, setInterests] = useState([]);
  const [popularGroups, setPopularGroups] = useState([]);
  const [recommendedGroups, setRecommendedGroups] = useState([]);
  const [groupsDisplay, setGroupsDisplay] = useState(true);

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interest-graph/popular/").then((resp) => {
      setPopularInterests(resp.data);
    });

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interests/").then((resp) => {
      setInterests(resp.data)
    });

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/groups/popular/").then((resp) => {
      setPopularGroups(resp.data.filter(p =>
        getUser().groups.filter(g => g.id == p.id).length == 0)
      )
    });

    axios.post(process.env.NEXT_PUBLIC_API_URL + "/recommendGroups/").then((resp) => {
      setRecommendedGroups(resp.data)
    });

    setUserInterests(getUser().interests);

  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Container component="main" maxWidth="sm" style={{ display: "flex", justifyContent: "center" }}>
        <Box className={formikClasses.card} >
          <Grid container spacing={5} style={{ display: "flex", justifyContent: "flex-end" }}>
            <Grid>
              <MyLink href={HOME_PATH}>
                <CloseOutlined />
              </MyLink>
            </Grid>
          </Grid>
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
          <Grid container style={{ maxHeight: "36px" }}>
            <Grid item xs={6} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                onClick={() => setGroupsDisplay(true)}>
                {groupsDisplay ? (<Typography style={{ fontWeight: 600 }}>Groups</Typography>)
                  : (<Typography>Groups</Typography>)}
              </Button>
            </Grid>
            <Grid item xs={6} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                onClick={() => setGroupsDisplay(false)}>
                {!groupsDisplay ? (<Typography style={{ fontWeight: 600 }}>Interests</Typography>)
                  : (<Typography>Interests</Typography>)}
              </Button>
            </Grid>
            &nbsp;
            </Grid>
          {groupsDisplay ? (
            <DiscoverGroups
              popularGroups={popularGroups}
              setPopularGroups={setPopularGroups}
              recommendedGroups={recommendedGroups}
              setRecommendedGroups={setRecommendedGroups}
            />
          ) : (
            <DiscoverInterests
              userInterests={userInterests}
              popularInterests={popularInterests}
              interests={interests}
              setUserInterests={setUserInterests}
            />
          )}
        </Box>
      </Container>
    </HorizontallyCenteredLayout >
  );
};

export default Discover;