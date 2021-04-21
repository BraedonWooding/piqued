import { Box, Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import axios from "axios";
import React, { FC, useLayoutEffect, useState } from "react";
import { Group } from "types";
import { SearchGroups } from "./SearchGroups";

interface DiscoverGroupsProps {
  popularGroups: Group[],
  setPopularGroups: (groups: Group[]) => void,
  recommendedGroups: Group[],
  setRecommendedGroups: (list: Group[]) => void
}

export const DiscoverGroups: FC<DiscoverGroupsProps> = ({ popularGroups, setPopularGroups, recommendedGroups, setRecommendedGroups }) => {
  const itemClasses = itemStyles();
  const [addedGroups, setAddedGroups] = useState<Group[]>([]);
  const [searchResults, setGroupResults] = useState<Group[]>([]);
  const searchClasses = searchStyles();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const updateGroupLists = () => {
    setPopularGroups(popularGroups.filter(p => addedGroups.filter(a => a.id == p.id).length == 0));
    setRecommendedGroups(recommendedGroups.filter(r => addedGroups.filter(a => a.id == r.id).length == 0));
  }

  useLayoutEffect(() => {
    updateGroupLists();
  }, [addedGroups]);

  return (

    <Box className={itemClasses.boxArea} >
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
                addedGroups.push(popularGroups.splice(index, 1)[0]);
                setAddedGroups([...addedGroups]);
                updateGroupLists();
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
                    await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + x.id + "/add_user/");
                    addedGroups.push(recommendedGroups.splice(index, 1)[0]);
                    updateGroupLists();
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
      <Typography variant="h6">Search Groups</Typography>
      <SearchGroups
        addedGroups={addedGroups}
        setAddedGroups={setAddedGroups}
        titleContainerStyle={itemClasses.titleContainer} />
    </Box>
  );
};

const itemStyles = makeStyles(() => ({
  centered: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
  titleContainer: { display: "flex", alignItems: "center", maxWidth: "100%", wordBreak: "break-all", overflowWrap: 'break-word', wordWrap: "break-word", },
  boxArea: {
    display: "flex",
    paddingTop: "20px",
    paddingBottom: "20px",
    paddingRight: "32px",
    paddingLeft: "32px",
    maxWidth: "600px",
    minWidth: "400px",
    alignItems: "center",
    flexDirection: "column",
  }
}));

const searchStyles = makeStyles(() => ({
  searchButton: { display: "flex", alignItems: "center", justifyContent: "center" },
  searchAvatar: { display: "flex", justifyContent: "center" },
  closeButton: { display: "flex", justifyContent: "flex-end" },
  resultsArea: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
}));

export default DiscoverGroups;