import { Avatar, Box, Button, Container, Grid, List, ListItem, ListItemText, makeStyles, Typography } from "@material-ui/core";
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
                {/* <Grid container > */}
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
                {/* </Grid> */}
                {/* <Avatar className={searchClasses.searchAvatar}>
                  <SearchRounded />
                </Avatar>
                <MyLink href={HOME_PATH} className={searchClasses.c}>
                  <CloseOutlined />
                </MyLink> */}
                {/* <Avatar> */}
                {/* </Avatar> */}
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
                  <Grid container spacing={1}>

                    <List className={searchClasses.resultsArea}>
                      {searchResults.map((result, index) => (
                        <ListItem key={index}>
                          {/* <Grid container> */}
                          {/* <Grid item xs={12}> */}
                          {/* <ChatMsg side={result. === activeUser.id ? "right" : "left"} messages={[chatMsg.message]} /> */}
                          <ListItemText>
                            {result.group_name}
                          </ListItemText>
                          <Button
                            onClick={async () => {
                              await axios.put("/api/groups/" + result.id + "/add_user");
                              searchResults.splice(index, 1);
                              console.log(searchResults);
                              setGroupResults(searchResults);
                              forceUpdate();
                            }}>
                            < Add />
                                Join Group
                            </Button>

                          {/* </Grid> */}
                          {/* </Grid> */}
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </Grid>
                <Typography>
                  <MyLink href={CREATE_GROUP_PATH}>
                    Can't find what you're after? Create Group
                  </MyLink>
                </Typography>
                {/* <NavButtonLink href={CREATE_GROUP_PATH} color="primary" variant="contained">
                  Create Group
                </NavButtonLink> */}
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
  resultsArea: {},
}));

export default SearchGroup;


