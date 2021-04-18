import { Avatar, Box, Button, Container, Grid, makeStyles, TextField, Typography } from "@material-ui/core";
import { Add, SearchTwoTone } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getUser, lookupCurrentUser, setUser } from "util/auth/user";
import { DISCOVER_ROOT_PATH, HOME_PATH } from "util/constants";

const DiscoverInterests = () => {
  const formikClasses = useStyles();
  const router = useRouter();
  const itemClasses = itemStyles();
  const [popularInterests, setPopularInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
  const [interests, setInterests] = useState([]);

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interest-graph/popular/").then((resp) => {
      setPopularInterests(resp.data)
    });

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interests/").then((resp) => {
      setInterests(resp.data)
    });

    setUserInterests(getUser().interests);

  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        enableReinitialize
        initialValues={{
          interests: [],
        }}
        onSubmit={async (values) => {
          values.interests?.map((x) => x.id);
          await axios.patch(process.env.NEXT_PUBLIC_API_URL + "/users/" + getUser().id + "/", {
            interests_id: userInterests.map((x) => x.id),
          });
          router.push(HOME_PATH);
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <Container component="main" maxWidth="xl" style={{ display: "flex", justifyContent: "center" }}>
              <Box className={formikClasses.card} >
                <Avatar>
                  <SearchTwoTone />
                </Avatar>
                <Typography variant="h5">
                  Discover Interests
                </Typography>
                &nbsp;
                <Typography variant="h6">
                  Popular Interests
                </Typography>
                {popularInterests.slice(0, 4).map((x, index) => (
                  <Grid container spacing={1} key={index}>
                    <Grid item xs={9} className={itemClasses.centered}>
                      <Typography>{x.name}</Typography>
                    </Grid>
                    <Grid item xs={3} className={itemClasses.joinGroupArea}>
                      <Button
                        onClick={async () => {
                          userInterests.push(x);
                          popularInterests.splice(index, 1);
                          setPopularInterests([...popularInterests]);
                        }}
                      >
                        <Add />
                      Add
                    </Button>
                    </Grid>
                  </Grid>
                ))}
                &nbsp;
                <Typography variant="h6" className={itemClasses.centered}>
                  User Interests
                </Typography>
                <Grid container>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="interests"
                      placeholder="Interests"
                      options={interests}
                      value={userInterests}
                      onChange={(e, values) => {
                        setFieldValue("interests", values);
                        setUserInterests(values);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Interests"
                          inputProps={{
                            ...params.inputProps,
                          }}
                        />
                      )}
                      getOptionLabel={(option) => `${option.name}`}
                      getOptionSelected={(option, value) => option.id === value.id}
                    />
                  </Grid>
                </Grid>
                &nbsp;
                &nbsp;
                <Button
                  color="primary"
                  type="submit"
                  onClick={() => {
                    router.push(DISCOVER_ROOT_PATH);
                  }}>
                  Submit
                </Button>
                <Button
                  color="primary"
                  onClick={() => router.push(DISCOVER_ROOT_PATH)}>
                  Cancel
                </Button>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout >
  );
};

const itemStyles = makeStyles(() => ({
  centered: { display: "flex", alignItems: "center" },
  joinGroupArea: { display: "flex", justifyContent: "flex-end" },
  titleContainer: { display: "flex", alignItems: "center", maxWidth: "100%", wordBreak: "break-all", overflowWrap: 'break-word', wordWrap: "break-word", },
  textStyle: {
    maxWidth: '100%',
    overflowWrap: 'break-word',
    display: "-webkit-box",
    webkitLineClamp: 3,
    webkitBoxOrient: "vertical",
    maxHeight: "3.6em"
  },
}));

export default DiscoverInterests;