import { Box, Button, Container, Grid, makeStyles, TextField, Typography } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import axios from "axios";
import { useStyles } from "components/Common/FormikUI";
import { Form, Formik } from "formik";
import React, { FC, useLayoutEffect, useState } from "react";
import { getUser } from "util/auth/user";

interface DiscoverInterestsProps {
  popularInterests: any[],
  userInterests: any[],
  interests: any[],
  setUserInterests: (list: any[]) => void
}

export const DiscoverInterests: FC<DiscoverInterestsProps> = ({ userInterests, popularInterests, interests, setUserInterests }) => {

  const formikClasses = useStyles();
  const [popularInterestsDisplay, setPopularInterestsDisplay] = useState([])
  const itemClasses = itemStyles();

  const updatePopularInterestDisplay = () => {
    var exclusive = popularInterests.filter(
      p => userInterests.filter(i => i.id == p.id).length == 0);
    setPopularInterestsDisplay(exclusive);
  }

  useLayoutEffect(() => {
    updatePopularInterestDisplay();
  }, [userInterests, popularInterests]);

  return (
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
      }}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form>
          <Container component="main" maxWidth="md" style={{ display: "flex", justifyContent: "center" }}>
            <Box className={itemClasses.boxArea}>
              <Typography variant="h6">
                Popular Interests
              </Typography>
              {popularInterestsDisplay.slice(0, 4).map((x, index) => (
                <Grid container spacing={1} key={index}>
                  <Grid item xs={9} className={itemClasses.titleContainer}>
                    <Typography>{x.name}</Typography>
                  </Grid>
                  <Grid item xs={3} className={itemClasses.joinGroupArea}>
                    <Button
                      onClick={async () => {
                        userInterests.push(x);
                        updatePopularInterestDisplay();
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
                Your Interests
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
                      updatePopularInterestDisplay();
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
                variant="contained"
                type="submit"
                disabled={isSubmitting}>
                Submit
              </Button>
            </Box>
          </Container>
        </Form>
      )}
    </Formik>
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
