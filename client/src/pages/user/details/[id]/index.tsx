import { Box, Container, Grid } from "@material-ui/core";
import { KeyboardDatePicker } from "@material-ui/pickers";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { AvatarPicker } from "components/Elements/AvatarPicker";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const fetchUser = async (id: string): Promise<any | undefined> => {
  try {
    return (await axios.get('/api/users/' + id + '/')).data;
  } catch {
    return null;
  }
}

const UserDetails = () => {
  const classes = useStyles();
  const router = useRouter();
  const { id } = router.query;
  let [user, setUser]: [any, any] = useState();
  let [loading, setLoading] = useState(true);
  let [img, setImg] = useState(null);

  useEffect(() => {
    if (id && !user) {
      fetchUser(id as string).then((u: any) => {u && setUser(u); u && setImg(u.profile_picture); setLoading(false);});
    }
  }, [id]);

  if (loading) return null;

  if (!user) return (
    <HorizontallyCenteredLayout>
      <h1> Error: 404 </h1>
      <p>No user found</p>
    </HorizontallyCenteredLayout>
  );

  const handleSave = async (img: any) => {
    user.profile_picture = await (await (await fetch(img)).blob()).text();
    setImg(img);
    // ew?
    setLoading(true);
    setLoading(false);
    return img;
  }

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={user}
        onSubmit={async ({ ...other }) => {
        }}
      >
        <Form>
          <Container component="main" maxWidth="sm">
            <Box className={classes.card}>
              <h2 className={classes.profileName}>{user.first_name} {user.last_name} ({user.username})</h2>
              <AvatarPicker baseUrl={img} onSaveAvatar={handleSave} />
              <Grid container spacing={3}>
                <Grid item xs={6}>
                  <MyTextField value={user.first_name} placeholder="First Name" label="First Name" name="first_name" autoFocus />
                </Grid>
                <Grid item xs={6}>
                  <MyTextField value={user.last_name} placeholder="Last Name" label="Last Name" name="last_name" />
                </Grid>
              </Grid>
              <Field
                  component={KeyboardDatePicker}
                  placeholder="Date of Birth"
                  label="Date of Birth"
                  name="date_of_birth"
                  format="dd/MM/yyyy"
                  value={user.date_of_birth}
                />
            </Box>
          </Container>
        </Form>
      </Formik>
    </HorizontallyCenteredLayout>
  );
};

export default UserDetails;
