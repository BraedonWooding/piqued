import { Box, Container, Grid, Typography } from "@material-ui/core";
import { KeyboardDatePicker } from "@material-ui/pickers";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { AvatarPicker } from "components/Elements/AvatarPicker";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { Field, Form, Formik } from "formik";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { User } from "types";

const fetchUser = async (id: string) => {
  try {
    return (await axios.get(`/api/users/${id}`)).data;
  } catch {
    return null;
  }
};

const UserDetails = () => {
  const classes = useStyles();
  const router = useRouter();
  const { id } = router.query;
  const [img, setImg] = useState<string>();
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === "string" && !user)
      fetchUser(id).then((u: User) => {
        if (u) setUser(u);
        setLoading(false);
      });
  }, [id]);

  if (loading) return null;
  else if (!user)
    return (
      <HorizontallyCenteredLayout>
        <Typography variant="h2"> Error: 404 </Typography>
        <Typography variant="h6">No user found</Typography>
      </HorizontallyCenteredLayout>
    );

  const handleSave = async (img: string) => {
    user.profile_picture = await (await (await fetch(img)).blob()).text();
    setUser({ ...user });
    return img;
  };

  return (
    <HorizontallyCenteredLayout>
      <Formik initialValues={user} onSubmit={async ({ ...other }) => {}}>
        {({ setFieldValue }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Typography className={classes.profileName} variant="h5">
                  {user.first_name} {user.last_name} ({user.username})
                </Typography>
                <AvatarPicker baseUrl={img} setBaseUrl={setImg} onSaveAvatar={handleSave} />
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <MyTextField placeholder="First Name" label="First Name" name="first_name" autoFocus />
                  </Grid>
                  <Grid item xs={6}>
                    <MyTextField placeholder="Last Name" label="Last Name" name="last_name" />
                  </Grid>
                </Grid>
                <Field
                  component={KeyboardDatePicker}
                  placeholder="Date of Birth"
                  label="Date of Birth"
                  name="date_of_birth"
                  format="dd/MM/yyyy"
                  onChange={(value: Date) => setFieldValue("date_of_birth", value)}
                />
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout>
  );
};

export default UserDetails;
