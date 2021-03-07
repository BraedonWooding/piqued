import { Box, Button, Container, Grid, Typography } from "@material-ui/core";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { default as axios } from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { AvatarPicker } from "components/Elements/AvatarPicker";
import { HorizontallyCenteredLayout } from "components/Layout/Layout";
import { format } from "date-fns";
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
    if (Number.isInteger(Number(id)) && !user)
      fetchUser(id as string).then((u: User) => {
        if (u) setUser(u);
        setLoading(false);
      });
  }, [id]);

  if (loading) return null;

  if (!user)
    return (
      <HorizontallyCenteredLayout>
        <Typography variant="h2"> Error: 404 </Typography>
        <Typography variant="h6">No user found</Typography>
      </HorizontallyCenteredLayout>
    );

  const handleSave = async (new_img: File) => {
    user.profile_picture = new_img.name;
    setImg((window.URL || window.webkitURL).createObjectURL(new_img));
    setUser({ ...user });
    return img;
  };

  return (
    <HorizontallyCenteredLayout>
      <Formik initialValues={user} onSubmit={async ({ ...other }) => {
        const formData = new FormData();

        let blob: File | null;
        if (user.profile_picture) {
          const ext = user.profile_picture.substring(user.profile_picture.lastIndexOf('.') + 1)
          blob = new File([(await (await (await fetch(img)).blob()).arrayBuffer())],
            `profile-${user.id}.${ext}`, {
            type: 'image/' + ext,
          });
        } else {
          blob = null;
        }
        if (blob) formData.append('profile_picture', blob);
        formData.append('first_name', other.first_name);
        formData.append('last_name', other.last_name);
        // if it's a string then just write the string
        formData.append('date_of_birth', other.date_of_birth instanceof Date ? format(other.date_of_birth, "yyyy-MM-dd") : other.date_of_birth);
        formData.append('id', String(id));
        formData.append('email', user.username);

        axios.patch('/api/users/' + id, formData, {
          headers: {
            'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNjE1MDg3NTc1LCJqdGkiOiIzZDcyMmE0MTBmY2Q0YzVmOWE3ODRkMmFiYjNiZmFlMiIsInVzZXJfaWQiOjF9.9YjKjah-rVGqPhpaBM52jBOX4GleLYkSub2MlWR6KOQ'
          },
        }).then(resp => {
          const user = resp.data as User
          if (user) setUser(user);
        });
      }}>
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Typography className={classes.profileName} variant="h5">
                  {user.first_name} {user.last_name} ({user.username})
              </Typography>
                <AvatarPicker initialUrl={img} onSaveAvatar={handleSave} />
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
                  validate={false}
                  required={false}

                  label="Date of Birth"
                  name="date_of_birth"
                  format="dd/MM/yyyy"
                  value={values.date_of_birth}
                  onChange={(value: Date) => setFieldValue("date_of_birth", value)}
                />
              &nbsp;
              <Button type="submit" color="primary" variant="contained" disabled={isSubmitting} >
                  Save
              </Button>
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout >
  );
};

export default UserDetails;
