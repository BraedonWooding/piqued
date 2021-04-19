import { Box, Button, Container, Grid, TextField, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Group } from "types";
import { getUser } from "util/auth/user";
import { HOME_PATH, SCRAPED_COURSES, SCRAPED_GROUPS, SCRAPED_PROGRAMS } from "util/constants";
import * as yup from "yup";

const validationSchema = yup.object({
  year: yup.number().min(1).max(10),
});

const InitDetails = () => {
  const classes = useStyles();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [interests, setInterests] = useState([]);
  const [userInterests, setUserInterests] = useState([]);
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
      console.log(resp);
      setInterests(resp.data);
    });
    setUserInterests(getUser().interests);
    if (localStorage.getItem(SCRAPED_COURSES)) {
      setSelectedCourses(JSON.parse(localStorage.getItem(SCRAPED_COURSES)));
      setSelectedPrograms(JSON.parse(localStorage.getItem(SCRAPED_PROGRAMS)));
    }
  }, []);

  const updateRecommendedGroups = () => {
    if (localStorage.getItem(SCRAPED_GROUPS)) {
      const userSelectedGroups: Group[] = [];
      const groups = JSON.parse(localStorage.getItem(SCRAPED_GROUPS)) as Group[];

      groups.forEach((g) => {
        selectedCourses.forEach((c) => {
          if (g.name.includes(c.course_code)) userSelectedGroups.push(g);
        });
        if (selectedPrograms && !userSelectedGroups.includes(g))
          selectedPrograms.forEach((p) => {
            if (p.name.includes(g.name)) userSelectedGroups.push(g);
          });
      });

      userSelectedGroups.map(async (g) => {
        await axios.put(process.env.NEXT_PUBLIC_API_URL + "/groups/" + g.id + "/add_user/");
      });
    }
  };

  return (
    <FullyCenteredLayout>
      <Formik
        enableReinitialize
        initialValues={{
          program: null,
          year: 1,
          courses: [],
          interests: [],
        }}
        onSubmit={async (values) => {
          values.interests?.map((x) => x.id);
          await axios.patch(process.env.NEXT_PUBLIC_API_URL + "/users/" + getUser().id + "/", {
            year: values.year,
            program_id: values.program?.id,
            courses_id: values.courses.map((x) => x.id),
            interests_id: userInterests.map((x) => x.id),
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
                      onChange={(e, value) => {
                        setFieldValue("program", value);
                        setSelectedPrograms(values);
                      }}
                      value={selectedPrograms}
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
