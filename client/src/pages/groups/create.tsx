import { Avatar, Box, Button, Container, Grid, makeStyles, TextField, Theme, Typography } from "@material-ui/core";
import { ChatBubbleOutline, CloseOutlined } from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { MyLink } from "components/Common/Link";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { User } from "types";
import { lookupCurrentUser } from "util/auth/user";
import { DISCOVER_ROOT_PATH, HOME_PATH } from "util/constants";

const CreateGroup = () => {
  const classes = useStyles();
  const [interests, setInterests] = useState([]);
  const customClasses = createStyles();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    lookupCurrentUser()
      .then(u => setUser(u));

    axios.get(process.env.NEXT_PUBLIC_API_URL + "/interests/").then((resp) => {
      setInterests(resp.data);
    });
  }, []);

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={{ name: "", interests: [] }}
        onSubmit={async (values) => {
          await axios.post(process.env.NEXT_PUBLIC_API_URL + "/groups/", {
            name: values.name,
            interests_id: values.interests.map((x) => x.id)
          });
          router.push(HOME_PATH);
        }}
      >
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Grid container spacing={5} style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Grid>
                    <MyLink href={DISCOVER_ROOT_PATH}>
                      <CloseOutlined />
                    </MyLink>
                  </Grid>
                </Grid>
                <Avatar>
                  <ChatBubbleOutline />
                </Avatar>
                <Typography variant="h5">Create a new group</Typography>
                <MyTextField placeholder="Group Name" label="Group Name" name="name" autoFocus />
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Autocomplete
                      multiple
                      id="interests"
                      placeholder="Interests"
                      options={interests}
                      onChange={(e, values) => {
                        setFieldValue("interests", values);
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
                  <Grid item xs={12} className={customClasses.interfaceButtons}>
                    {user?.groups_created.length >= 3 ? (
                      <Box textAlign="center" flexDirection="column">
                        <Button type="submit" color="primary" variant="contained" disabled>
                          Create Group
                        </Button>
                        < Typography className={customClasses.error}>
                          You have reached the limit of creating 3 groups.
                          </Typography>
                      </Box>
                    ) : (
                      <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                        Create Group
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout >
  );
};

const createStyles = makeStyles((theme: Theme) => ({
  interfaceButtons: { display: "flex", justifyContent: "center" },
  error: { color: theme.palette.error.main },
}));

export default CreateGroup;
