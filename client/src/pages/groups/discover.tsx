import { Avatar, Box, Button, Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { Add, Search, SearchTwoTone } from "@material-ui/icons";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getUser, lookupCurrentUser, setUser } from "util/auth/user";
import { HOME_PATH, SEARCH_GROUPS_PATH } from "util/constants";

const Discover = () => {
  const formikClasses = useStyles();
  const router = useRouter();
  const itemClasses = itemStyles();
  const [popularGroups, setPopularGroups] = useState([]);
  const [popularInterests, setPopularInterests] = useState([]);
  const [recommendedGroups, setRecommendGroups] = useState([]);

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/groups/popular/").then((resp) => {
      setPopularGroups(resp.data)
    });

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interest-graph/popular/").then((resp) => {
      setPopularInterests(resp.data)
    });

    // TODO: add get request for recommended groups


  }, []);

  return (
    <HorizontallyCenteredLayout>

      <Container component="main" maxWidth="xl" style={{ display: "flex", justifyContent: "center" }}>
        <Box className={formikClasses.card} >
          <Avatar>
            <SearchTwoTone />
          </Avatar>
          <Typography variant="h5">
            Discover
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Grid item xs={12} style={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="h6">
                  Popular Interests
                </Typography>
              </Grid>
              {popularInterests.slice(0, 4).map((x, index) => (
                <Grid container spacing={1} key={index}>
                  <Grid item xs={9} className={itemClasses.centered}>
                    <Typography>{x.name}</Typography>
                  </Grid>
                  <Grid item xs={3} className={itemClasses.joinGroupArea}>
                    <Button
                      onClick={async () => {
                        await axios.patch(process.env.NEXT_PUBLIC_API_URL + "/users/" + getUser().id + "/", {
                          interests_id: [x.id]
                        });
                        popularInterests.splice(index, 1);
                        setPopularInterests([...popularInterests]);
                      }}
                    >
                      <Add />
                      Add
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={12} style={{ display: "flex", justifyContent: "center" }}>
                <Typography variant="h6" className={itemClasses.centered}>
                  Popular Groups
                </Typography>
              </Grid>
              {popularGroups.slice(0, 4).map((x, index) => (
                <Grid container spacing={1} key={index}>
                  <Grid item xs={9} className={itemClasses.titleContainer}>
                    <Typography className={itemClasses.textStyle}>{x.name}</Typography>
                  </Grid>
                  <Grid item xs={3} className={itemClasses.joinGroupArea}>
                    <Button
                      onClick={async () => {
                        await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + x.id + "/add_user/");
                        popularGroups.splice(index, 1);
                        setPopularGroups([...popularGroups]);
                      }}
                    >
                      <Add />
                      Join
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
          &nbsp;
          &nbsp;
          <Typography variant="h6">
            Recommended Groups
          </Typography>
          <Grid item xs={6} style={{ display: "flex", alignItems: "center" }}>
            <Grid container >
              {popularGroups.slice(0, 4).map((x, index) => (
                <Grid container spacing={1} key={index} >
                  <Grid item xs={9} className={itemClasses.centered}>
                    <Typography>{x.name}</Typography>
                  </Grid>
                  <Grid item xs={3} className={itemClasses.joinGroupArea}>
                    <Button
                      onClick={async () => {
                        await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + x.id + "/add_user/");
                        // remove from popular interests
                      }}
                    >
                      <Add />
                        Join
                    </Button>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
          &nbsp;
          <Button
            color="primary"
            variant="text"
            onClick={() => router.push(SEARCH_GROUPS_PATH)}>
            <Search />
              Search Groups
          </Button>
          <Button
            color="primary"
            variant="text"
            onClick={() => router.push(HOME_PATH)}>
            Cancel
          </Button>
        </Box>
      </Container>
    </HorizontallyCenteredLayout >
  );
};

const itemStyles = makeStyles(() => ({
  centered: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
  titleContainer: { display: "flex", alignItems: "center", maxWidth: "100%", wordBreak: "break-all", overflowWrap: 'break-word', wordWrap: "break-word", },
  textStyle: {
    maxWidth: '100%',
    overflowWrap: 'break-word',
    display: "-webkit-box",
    webkitLineClamp: 3,
    webkitBoxOrient: "vertical",
    maxHeight: "3.6em"
  },
}));

export default Discover;