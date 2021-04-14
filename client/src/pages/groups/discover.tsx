import { Grid, Paper, Typography } from "@material-ui/core";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import React, { useEffect, useState } from "react";

export const Discover = () => {
  const classes = useStyles();
  const [popularGroups, setPopularGroups] = useState([]);
  const [popularInterets, setPopularInterests] = useState([]);

  useEffect(() => {
    axios.get(process.env.NEXT_PUBLIC_API_URL + "/groups/popular/").then((resp) => {
      setPopularGroups(resp.data)
    });

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interest-graph/popular/").then((resp) => {
      setPopularInterests(resp.data)
    });

    // TODO: add get request for recommended groups

  }, []);

  console.log(popularGroups);
  console.log(popularInterets);

  return (
    < Grid container component={Paper} >
      <Grid item xs={12}>
        <Typography>
          Discover
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          Popular Interests
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          / Interest list /
      </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          Popular Groups
      </Typography>
      </Grid>
      <Grid item xs={12}>
        <Typography>
          / Group list /
      </Typography>
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
  )
};

export default Discover;