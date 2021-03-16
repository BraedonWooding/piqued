import { Avatar, Box, Button, Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { Add, CloseOutlined, SearchRounded } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React from "react";
import { Group } from "types";
import { CREATE_GROUP_PATH, HOME_PATH } from "util/constants";

const SearchGroup = () => {
  const [searchResults, setGroupResults] = React.useState<Group[]>([]);
  const formikClasses = useStyles();
  const searchClasses = searchStyles();
  const forceUpdate = React.useReducer(() => ({}), {})[1] as () => void;
  const router = useRouter();
  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ query_term: "", users: [] }}
        onSubmit={async (values) => {
          var resp = await axios.get("/api/groups/?search=" + values.query_term);
          setGroupResults(resp.data);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={formikClasses.card}>
                <Grid container spacing={5} className={searchClasses.closeButton}>
                  <Grid>
                    <MyLink href={HOME_PATH}>
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
                <Typography variant="h5">
                  Recommended Groups/Group Search
                </Typography>
                <Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={9}>
                      <MyTextField placeholder="Group Name" label="Group Name" name="query_term" autoFocus />
                    </Grid>
                    <Grid item xs={3} className={searchClasses.searchButton} >
                      <Button
                        type="submit" color="primary" variant="contained" disabled={isSubmitting} >
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                  {searchResults.map((result, index) => (
                    <Grid container spacing={1} key={index} >
                      <Grid item xs={6} className={searchClasses.resultsArea}>
                        <Typography>
                          {result.name}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} className={searchClasses.joinGroupArea}>
                        < Button
                          onClick={async () => {
                            await axios.put("/api/groups/" + result.id + "/add_user");
                            searchResults.splice(index, 1);
                            console.log(searchResults);
                            setGroupResults(searchResults);
                            forceUpdate();
                          }}>
                          < Add />
                            Join
                        </Button>
                      </Grid>
                    </Grid>
                  ))}
                </Grid>
                &nbsp;
                <Typography>
                  <MyLink href={CREATE_GROUP_PATH}>
                    Can't find what you're after? Create Group
                  </MyLink>
                </Typography>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout >
  )
};

const searchStyles = makeStyles(() => ({
  searchButton: { display: "flex", alignItems: "center", justifyContent: "center" },
  searchAvatar: { display: "flex", justifyContent: "center" },
  closeButton: { display: "flex", justifyContent: "flex-end" },
  resultsArea: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
}));

export default SearchGroup;


