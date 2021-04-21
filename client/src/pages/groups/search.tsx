import { Avatar, Box, Button, Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { Add, CloseOutlined, SearchRounded } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useEffect, useState } from "react";
import { Group } from "types";
import { getUser, lookupCurrentUser, setUser } from "util/auth/user";
import { CREATE_GROUP_PATH, DISCOVER_GROUPS_PATH } from "util/constants";

const SearchGroup = () => {

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));
  }, []);

  const [searchResults, setGroupResults] = useState<Group[]>([]);
  const [addedGroups, setAddedGroups] = useState<Group[]>([]);
  const formikClasses = useStyles();
  const searchClasses = searchStyles();
  const [hasSubmitted, setHasSubmitted] = useState(false);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ query_term: "" }}
        onSubmit={async (values) => {
          const resp = await axios.get(process.env.NEXT_PUBLIC_API_URL + "/groups/?search=" + values.query_term);
          setGroupResults(resp.data.filter((x: Group) =>
            getUser().groups.filter(y => y.id == x.id).length == 0
            && addedGroups.filter(y => y.id == x.id).length == 0)
          );
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={formikClasses.card}>
                <Grid container spacing={5} className={searchClasses.closeButton}>
                  <Grid>
                    <MyLink href={DISCOVER_GROUPS_PATH}>
                      <CloseOutlined />
                    </MyLink>
                  </Grid>
                </Grid>
                <Grid container className={searchClasses.searchAvatar}>
                  <Grid>
                    <Avatar>
                      <SearchRounded />
                    </Avatar>
                  </Grid>
                </Grid>
                <Typography variant="h5">Recommended Groups/Group Search</Typography>
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
                      <Grid item xs={6} className={searchClasses.resultsArea}>
                        <Typography>{result.name}</Typography>
                      </Grid>
                      <Grid item xs={6} className={searchClasses.joinGroupArea}>
                        <Button
                          onClick={async () => {
                            await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + result.id + "/add_user/");
                            var rem = searchResults.splice(index, 1)[0];
                            addedGroups.push(rem);
                            setAddedGroups([...addedGroups]);
                            setGroupResults([...searchResults]);
                            setHasSubmitted(true);
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
                      <Grid xs={12} className={searchClasses.searchAvatar}>
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
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout >
  );
};

export const searchStyles = makeStyles(() => ({
  searchButton: { display: "flex", alignItems: "center", justifyContent: "center" },
  searchAvatar: { display: "flex", justifyContent: "center" },
  closeButton: { display: "flex", justifyContent: "flex-end" },
  resultsArea: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
}));

export default SearchGroup;
