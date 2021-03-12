import { Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { FullyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import * as yup from "yup";

const validationSchema = yup.object({
    year: yup
        .number()
        .min(1)
        .max(10),
});

const InitDetails = () => {
    const classes = useStyles();
    // const programs = JSON.parse((await axios.get("/api/info/programs/")).data) as any[];
    const [courses, setCourses] = useState([]);
    const [degrees, setDegree] = useState([]);

    useEffect(() => {
        axios.get("/api/info/courses/")
            .then((resp) => {
                setCourses(resp.data);
            })
        axios.get("/api/info/programs/")
            .then((resp) => {
                setDegree(resp.data);
            })
    }, []);

    return (
        <FullyCenteredLayout>
            <Formik
                initialValues={{
                    year: 1,
                    courses: [],
                    program: null
                }}
                onSubmit={async (details) => {
                    await axios.post("/api/users", details);
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
                                            id="degree"
                                            options={degrees}
                                            getOptionLabel={(option) => option.name ?? ""}
                                            renderInput={(params) => (
                                                <MyTextField
                                                    {...params}
                                                    name="degree"
                                                    label="Select Degree"
                                                    placeholder="Degree"
                                                />
                                            )}
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
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            multiple
                                            id="courses"
                                            options={courses}
                                            getOptionLabel={(option) => option.course_name ?? ""}
                                            renderInput={(params) => (
                                                <MyTextField
                                                    {...params}
                                                    name="courses"
                                                    label="Can select multiple"
                                                    placeholder="Courses"
                                                />
                                            )}
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
        </FullyCenteredLayout >
    );
};

export default InitDetails;
