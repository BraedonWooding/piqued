import { Avatar, Box, Button, Chip, Container, Grid, Typography } from "@material-ui/core";
import { blue, cyan, deepOrange, deepPurple, green, lightGreen, orange, teal } from "@material-ui/core/colors";
import { Add, CloseOutlined, RssFeed } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { searchStyles } from "pages/groups/search";
import React, { useEffect, useState } from "react";
import { lookupCurrentUser, setUser } from "util/auth/user";
import { DISCOVER_GROUPS_PATH, DISCOVER_INTERESTS_PATH, HOME_PATH } from "util/constants";

const LOOKUP_FEEDS_BASE_URL = "/rss/query?query=";

interface FeedType {
  deliciousTags: string[];
  description: string;
  lastUpdated: number;
  title: string;
  iconUrl: string;
  tagCounts: {[key: string]: number};
  totalTagCount: number;
  id: string;
}

const RssManager = () => {
  const formikClasses = useStyles();
  const searchClasses = searchStyles();
  const [searchResults, setSearchResults] = useState<FeedType[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  const colorMaps = {
    0: blue[50],
    10: orange[300],
    20: cyan[200],
    30: teal[300],
    40: blue[300],
    50: cyan[400],
    60: deepOrange[400],
    70: deepPurple[200],
    80: green[300],
    90: lightGreen[500],
    100: green[400],
  };
  const mapTagToColor = (item: FeedType, tag: string) => {
    const section = Math.floor(item.tagCounts[tag] / item.totalTagCount * 100 / 10) * 10;
    return colorMaps[section];
  };

  useEffect(() => {
    lookupCurrentUser().then((u) => setUser(u));
  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ query_term: "" }}
        onSubmit={async (values) => {
          setHasSubmitted(true);
          try {
            const resp = await axios.get(process.env.NEXT_PUBLIC_API_URL + LOOKUP_FEEDS_BASE_URL + values.query_term);
            setSearchResults((resp.data && resp.data.results && resp.data.results) || []);
          } catch {
            setSearchResults([]);
          }
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
                      <RssFeed />
                    </Avatar>
                  </Grid>
                </Grid>
                <Typography variant="h5">Manage RSS Feeds</Typography>
                <Typography>Subscribe to news, events, weather updates, and more!</Typography>
                <Grid>
                  <Grid container spacing={1}>
                    <Grid item xs={9}>
                      <MyTextField placeholder="Keywords" label="Keywords" name="query_term" autoFocus />
                    </Grid>
                    <Grid item xs={3} className={searchClasses.searchButton}>
                      <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                  {searchResults.map((result, index) => (
                    <Grid container key={index}>
                      <Grid container>
                        <Grid item xs={10} className={searchClasses.resultsArea}>
                          <Grid container alignItems="center" direction="row" spacing={1}>
                            <Grid item>
                              <Typography>{result.title}</Typography>
                            </Grid>
                            {result.iconUrl && (<Grid item>
                              <img width="25" height="25" src={result.iconUrl} />
                            </Grid>)}
                          </Grid>
                        </Grid>
                        <Grid item xs={2} className={searchClasses.joinGroupArea}>
                          <Button
                            onClick={async () => {
                              setHasSubmitted(true);
                            }}
                          >
                            <Add />
                            Join
                          </Button>
                        </Grid>
                        <Grid container spacing={1}>
                          {result.deliciousTags.slice(0, 5).map((tag) => (
                            <Grid item>
                              <Chip style={{backgroundColor: mapTagToColor(result, tag)}} size="small" label={tag} />
                            </Grid>
                          ))}
                        </Grid>
                        <Typography style={{ fontSize: 12 }}>{result.description}</Typography>
                      </Grid>
                    </Grid>
                  ))}
                  {searchResults.length == 0 && hasSubmitted ? (
                    <Grid container spacing={2}>
                      <Grid xs={12} className={searchClasses.searchAvatar}>
                        <Typography>No interests found</Typography>
                      </Grid>
                    </Grid>
                  ) : null}
                  {/* {searchResults.length == 0 && hasSubmitted ? (
                    <Grid container spacing={2}>
                      <Grid xs={12} className={searchClasses.searchAvatar}>
                        <Typography>No groups found</Typography>
                      </Grid>
                    </Grid>
                  ) : null} */}
                </Grid>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout>
  );
};

export default RssManager;
