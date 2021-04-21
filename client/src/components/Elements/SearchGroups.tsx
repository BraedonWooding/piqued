import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import axios from "axios";
import { MyTextField } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { Form, Formik } from "formik";
import React, { FC, useLayoutEffect, useState } from "react";
import { Group } from "types";
import { getUser } from "util/auth/user";
import { CREATE_GROUP_PATH } from "util/constants";
interface SearchGroupsProps {
  addedGroups: Group[],
  setAddedGroups: (list: Group[]) => void,
  titleContainerStyle,
}

export const SearchGroups: FC<SearchGroupsProps> = ({ addedGroups, setAddedGroups, titleContainerStyle }) => {

  const [searchResults, setGroupResults] = useState<Group[]>([]);
  const searchClasses = searchStyles();
  const [hasSubmitted, setHasSubmitted] = useState(false);


  useLayoutEffect(() => {
    setGroupResults(searchResults.filter((x: Group) =>
      getUser().groups.filter(y => y.id == x.id).length == 0
      && addedGroups.filter(y => y.id == x.id).length == 0));

    console.log("layout effect");
  }, [addedGroups])

  return (
    <Formik
      initialValues={{ query_term: "" }}
      onSubmit={async (values) => {
        const resp = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/groups/?search=" + values.query_term);
        setGroupResults(resp.data.filter((x: Group) =>
          getUser().groups.filter(y => y.id == x.id).length == 0
          && addedGroups.filter(y => y.id == x.id).length == 0)
        );
        setHasSubmitted(true);
      }}
    >
      {({ isSubmitting }) => (
        <Form>
          <Grid>
            <Grid container spacing={1}>
              <Grid item xs={9}>
                <MyTextField placeholder="Group Name" label="Group Name" name="query_term" autoFocus />
              </Grid>
              <Grid item xs={3} className={searchClasses.searchButton}>
                <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                  Search
                </Button>
              </Grid>
            </Grid>
            {searchResults.map((result, index) => (
              <Grid container spacing={1} key={index}>
                <Grid item xs={9} className={titleContainerStyle}>
                  <Typography>{result.name}</Typography>
                </Grid>
                <Grid item xs={3} className={searchClasses.joinGroupArea}>
                  <Button
                    onClick={async () => {
                      await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + result.id + "/add_user/");
                      var rem = searchResults.splice(index, 1)[0];
                      addedGroups.push(rem);
                      setAddedGroups([...addedGroups]);
                      setGroupResults([...searchResults]);
                    }}
                  >
                    <Add />
                    Join
                  </Button>
                </Grid>
              </Grid>
            ))}
            {searchResults.length == 0 && hasSubmitted ?
              <Grid container spacing={2}>
                <Grid item xs={12} className={searchClasses.searchAvatar}>
                  <Typography>
                    No groups found
                  </Typography>
                </Grid>
              </Grid>
              : null
            }
          </Grid>
            &nbsp;
          <Typography>
            <MyLink href={CREATE_GROUP_PATH}>Can't find what you're after? Create Group</MyLink>
          </Typography>
        </Form >
      )}
    </Formik >
  );
};

const searchStyles = makeStyles(() => ({
  searchButton: { display: "flex", alignItems: "center", justifyContent: "center" },
  searchAvatar: { display: "flex", justifyContent: "center" },
  closeButton: { display: "flex", justifyContent: "flex-end" },
  resultsArea: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
}));
