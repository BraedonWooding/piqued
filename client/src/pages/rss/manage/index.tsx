import { Avatar, Box, Button, Chip, Container, Grid, makeStyles, Typography } from "@material-ui/core";
import { blue, cyan, deepOrange, deepPurple, green, lightGreen, orange, teal } from "@material-ui/core/colors";
import { Add, CloseOutlined, RssFeed } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { lookupCurrentUser, setUser } from "util/auth/user";
import { HOME_PATH } from "util/constants";

const LOOKUP_FEEDS_BASE_URL = "/rss/query?query=";

interface FeedType {
  deliciousTags: string[];
  description: string;
  lastUpdated: number;
  title: string;
  iconUrl: string;
  tagCounts: { [key: string]: number };
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
  const [feeds, setFeeds] = useState<string[]>([]);

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
    const section = Math.floor(((item.tagCounts[tag] / item.totalTagCount) * 100) / 10) * 10;
    return colorMaps[section];
  };

  useEffect(() => {
    axios
      .get(process.env.NEXT_PUBLIC_API_URL + "/groups/" + id + "/")
      .then((resp) => {
        setFeeds(((resp.data && resp.data.feeds) || []).map(x => x.feed_id));
      })
      .catch(() => setFeeds([]));
  }, [searchResults]);

  useEffect(() => {
    lookupCurrentUser().then((u) => setUser(u));
  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ query_term: "" }}
        onSubmit={async (values) => {
          try {
            const resp = await axios.get(process.env.NEXT_PUBLIC_API_URL + LOOKUP_FEEDS_BASE_URL + values.query_term);
            setHasSubmitted(true);
            setSearchResults((resp.data && resp.data.results && resp.data.results.filter((f: FeedType) => !feeds.includes(f.id))) || []);
          } catch {
            setHasSubmitted(true);
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
                    <Grid container key={result.id}>
                      <Grid container>
                        <Grid item xs={10} className={searchClasses.resultsArea}>
                          <Grid container alignItems="center" direction="row" spacing={1}>
                            <Grid item>
                              <Typography>{result.title}</Typography>
                            </Grid>
                            {result.iconUrl && (
                              <Grid item>
                                <img width="25" height="25" src={result.iconUrl} />
                              </Grid>
                            )}
                          </Grid>
                        </Grid>
                        <Grid item xs={2} className={searchClasses.joinGroupArea}>
                          <Button
                            onClick={async () => {
                              setHasSubmitted(true);
                              axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + id + "/add_feed/", {
                                feed_id: result.id,
                                image_url: result.iconUrl,
                                name: result.title
                              });
                              searchResults.splice(index, 1);
                              setSearchResults([...searchResults]);
                            }}
                          >
                            <Add />
                            Join
                          </Button>
                        </Grid>
                        <Grid container spacing={1}>
                          {result.deliciousTags.slice(0, 5).map((tag) => (
                            <Grid item>
                              <Chip style={{ backgroundColor: mapTagToColor(result, tag) }} size="small" label={tag} />
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
                        <Typography>No feeds found</Typography>
                      </Grid>
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout>
  );
};

const searchStyles = makeStyles(() => ({
  searchButton: { display: "flex", alignItems: "center", justifyContent: "center" },
  searchAvatar: { display: "flex", justifyContent: "center" },
  closeButton: { display: "flex", justifyContent: "flex-end" },
  resultsArea: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
}));

export default RssManager;
