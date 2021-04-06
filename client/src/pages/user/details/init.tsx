import { Box, Button, Container, Grid, TextField, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { getUser } from "util/auth/user";
import { HOME_PATH, SCRAPED_COURSES, SCRAPED_GROUPS, SCRAPED_PROGRAMS } from "util/constants";
import * as yup from "yup";

const validationSchema = yup.object({
  year: yup.number().min(1).max(10),
});

const InitDetails = () => {
  const classes = useStyles();
  const [courses, setCourses] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [interests, setInterests] = useState([]);
  const router = useRouter();
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState(null);


  useEffect(() => {
    axios.get(process.env.NEXT_PUBLIC_API_URL + "/info/courses/").then((resp) => {
      setCourses(resp.data);
    });
    axios.get(process.env.NEXT_PUBLIC_API_URL + "/info/programs/").then((resp) => {
      setDegrees(resp.data);
    });
    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interests/").then((resp) => {
      setInterests(resp.data);
    });
    setSelectedCourses(JSON.parse(localStorage.getItem(SCRAPED_COURSES)))
    setSelectedPrograms(JSON.parse(localStorage.getItem(SCRAPED_PROGRAMS)))
  }, []);

  const addToGroups = (groups) => {
    groups.map(async g => {
      await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + g.id + "/add_user/");
    });
  };

  const updateRecommendedGroups = () => {
    var userSelectedGroups = [];
    var groups = JSON.parse(localStorage.getItem(SCRAPED_GROUPS));
    var prog = selectedPrograms;
    groups.map(g => {
      selectedCourses.filter(c => g.name.includes(c.course_code)).length !== 0 ? userSelectedGroups.push(g) : null;
      if (prog != undefined) {
        prog.name.includes(g.name) ? userSelectedGroups.push(g) : null;
      }
    });
    addToGroups(userSelectedGroups);
  };

  return (
    <FullyCenteredLayout>
      <Formik
        initialValues={{
          program: null,
          year: 1,
          courses: [],
        }}
        onSubmit={async (values) => {
          await axios.patch(process.env.NEXT_PUBLIC_API_URL + "/users/" + getUser().id + "/", {
            year: values.year,
            program: values.program?.id,
            courses: values.courses?.map((x) => x.id),
          });
          updateRecommendedGroups();
          router.push(HOME_PATH);
        }}
        validationSchema={validationSchema}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Typography variant="h5">Manually Enter Details</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Autocomplete
                      id="program"
                      placeholder="program"
                      value={selectedPrograms}
                      onChange={(e, values) => {
                        setFieldValue("program", values);
                        setSelectedPrograms(values);
                      }}
                      options={degrees}
                      renderInput={(params) => <TextField {...params} variant="outlined" label="Degree" required />}
                      getOptionLabel={(option) => `${option.name}`}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MyTextField
                      id="year"
                      name="year"
                      label="Year"
                      type="number"
                      InputProps={{
                        inputProps: {
                          min: 1,
                          max: 10,
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="courses"
                      placeholder="Courses"
                      options={courses}
                      value={selectedCourses}
                      onChange={(e, values) => {
                        setFieldValue("courses", values);
                        setSelectedCourses(values);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="outlined"
                          label="Courses"
                          inputProps={{
                            ...params.inputProps,
                          }}
                        />
                      )}
                      getOptionLabel={(option) => `${option.course_name} (${option.course_code})`}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="interests"
                      placeholder="Interests"
                      options={interests}
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
                    />
                  </Grid>
                </Grid>
                &nbsp;
                <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                  Submit
                </Button>
                &nbsp;
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </FullyCenteredLayout>
  );
};

export default InitDetails;
