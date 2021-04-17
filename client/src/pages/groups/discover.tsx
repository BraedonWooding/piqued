import { Avatar, Box, Container, Grid, Typography } from "@material-ui/core";
import { SearchTwoTone } from "@material-ui/icons";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import React, { useEffect, useState } from "react";

const addItemToUser = () => {

};

export const Discover = () => {
  const formikClasses = useStyles();
  const [popularGroups, setPopularGroups] = useState([]);
  const [popularInterests, setPopularInterests] = useState([]);

  useEffect(() => {
    axios.get(process.env.NEXT_PUBLIC_API_URL + "/groups/popular/").then((resp) => {
      setPopularGroups(resp.data)
    });

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interest-graph/popular/").then((resp) => {
      setPopularInterests(resp.data)
    });

    // TODO: add get request for recommended groups

  }, []);

  // console.log(popularGroups);
  // console.log(popularInterests);

  return (
    <HorizontallyCenteredLayout>
      <Container component="main" maxWidth="sm">
        <Box className={formikClasses.card}>

          < Grid container>
            <Grid item xs={12}>
              <Avatar>
                <SearchTwoTone />
              </Avatar>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h5">
                Discover
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                Popular Interests
              </Typography>
            </Grid>
            <Grid item xs={12}>

            </Grid>
            <Grid item xs={12}>
              <Typography>
                Popular Groups
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {/* {popularGroups.map((x, index) => {

                <DiscoverItem
                  itemId={x.id}
                  actionText="Join"
                  itemText={x.name}
                  itemIndex={index}
                  joinCallback={addItemToUser}
                />
              })} */}
            </Grid>
            <Grid item xs={12}>
              <Typography>
                Recommended Groups
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                / recommended list /
              </Typography>
            </Grid>
          </Grid >
        </Box>
      </Container>
    </HorizontallyCenteredLayout >
  )
};

export default Discover;