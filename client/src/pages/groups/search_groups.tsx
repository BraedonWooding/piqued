import { Avatar, Box, Container, Grid, Typography } from "@material-ui/core";
import { SearchRounded } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { NavButtonLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import React from "react";
import { CREATE_GROUP_PATH } from "util/constants";


const SearchGroup = () => {
    const classes = useStyles();
    return (
        <HorizontallyCenteredLayout>
            <Formik
              initialValues={{ group_name: "", users: []}}
              onSubmit={async (values) => {
              await axios.post("/api/groups", values); // change endpoint here
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Container component="main" maxWidth="sm">
                    <Box className={classes.card}>
                      <Avatar>
                        <SearchRounded/>
                      </Avatar>
                      <Typography variant="h5">
                        Recommended Groups/Group Search
                      </Typography>
                      &nbsp;
                      <MyTextField placeholder="Group Name" label="GroupName" name="group_name"/>

                      <Grid container spacing={4}>
                        <Grid>
                        </Grid>
                      </Grid>
                      &nbsp;
                      <NavButtonLink href={CREATE_GROUP_PATH} color="primary" variant="contained">
                        Create Group
                      </NavButtonLink>
                    </Box>
                  </Container>
                </Form>
              )}
            </Formik>
        </HorizontallyCenteredLayout>
    )
};
export default SearchGroup;


