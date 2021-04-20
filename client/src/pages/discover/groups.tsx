import { Avatar, Box, Button, Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { Add, Search, SearchTwoTone } from "@material-ui/icons";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { lookupCurrentUser, setUser } from "util/auth/user";
import { DISCOVER_ROOT_PATH, SEARCH_GROUPS_PATH } from "util/constants";

const DiscoverGroups = () => {
  const formikClasses = useStyles();
  const router = useRouter();
  const itemClasses = itemStyles();
  const [popularGroups, setPopularGroups] = useState([]);
  const [recommendedGroups, setRecommendedGroups] = useState([]);

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/groups/popular/").then((resp) => {
      setPopularGroups(resp.data)
    });

    axios.post(process.env.NEXT_PUBLIC_API_URL + "/recommendGroups/").then((resp) => {
      setRecommendedGroups(resp.data)
    });

  }, []);

  return (
    <HorizontallyCenteredLayout>

      <Container component="main" maxWidth="xl" style={{ display: "flex", justifyContent: "center" }}>
        <Box className={formikClasses.card} >
          <Avatar>
            <SearchTwoTone />
          </Avatar>
          <Typography variant="h5">
            Discover Groups
          </Typography>
          &nbsp;
          <Typography variant="h6" className={itemClasses.centered}>
            Popular Groups
          </Typography>
          {popularGroups.slice(0, 4).map((x, index) => (
            <Grid container spacing={1} key={index}>
              <Grid item xs={9} className={itemClasses.titleContainer}>
                <Typography>{x.name}</Typography>
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
          &nbsp;
          <Typography variant="h6">
            Recommended Groups
          </Typography>
          <Grid item xs={6} style={{ display: "flex", alignItems: "center" }}>
            <Grid container >
              {recommendedGroups.slice(0, 4).map((x, index) => (
                <Grid container spacing={1} key={index} >
                  <Grid item xs={9} className={itemClasses.titleContainer}>
                    <Typography>{x.name}</Typography>
                  </Grid>
                  <Grid item xs={3} className={itemClasses.joinGroupArea}>
                    <Button
                      onClick={async () => {
                        if (x.existing === true) {
                          await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + x.id + "/add_user/");
                          popularGroups.splice(index, 1);
                          setPopularGroups([...popularGroups]);
                        } else {
                          const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/createGroup/`, {
                            group: x
                          });
                          console.log(response.data.id)
                          await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + response.data.id + "/add_user/");
                          popularGroups.splice(index, 1);
                          setPopularGroups([...popularGroups]);
                        }


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
            onClick={() => router.push(DISCOVER_ROOT_PATH)}>
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

}));

export default DiscoverGroups;