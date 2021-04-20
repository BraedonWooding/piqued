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
import { getUser } from "util/auth/user";
import { ShortcutCreator } from "components/Elements/ShortcutCreator";
import { v4 as uuidv4 } from 'uuid';

const fetchUser = async (id: string) => {
  try {
    return (await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}/`)).data;
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
  const [activeUser, setActiveUser] = useState<User | null>();
  const [isActiveUser, setIsActiveUser] = useState<boolean>(false);
  const [shortcuts, setShortcuts] = useState([["", "", uuidv4(), ""]]);
  const [showAddButton, setShowAddButton] = useState(false);

  useEffect(() => {
    if (Number.isInteger(Number(id)) && !user) {
      const user = getUser();
      setActiveUser(user);
      const shortcutObject = JSON.parse(user.shortcuts);
      // if (Object.keys(shortcutObject).length > 0) {
      setShowAddButton(true);
      // }
      setShortcuts(shortcutObject);
      setImg(user.profile_picture);
      setIsActiveUser(user.id == Number(id));
      fetchUser(id as string).then((u: User) => {
        if (u) setUser(u);
        setLoading(false);
      });
    }
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

  const handleShortcutSave = async (url: string, shortcutName: string, id: string, extension: string) => {
    if (url == null) {
      url = "";
    }

    var newArr = [...shortcuts];
    newArr = newArr.filter(entry => entry[2] == id); // Get the item with the matching id
    const index = shortcuts.indexOf(newArr[0]);
    
    var tempArr = [shortcutName, url, shortcuts[index][2], extension];
    newArr = [...shortcuts]; // copying the old array
    newArr[index] = tempArr;
    setShortcuts(newArr);
  }

  const handleAddShortcut = () => {
    const id = uuidv4();
    setShortcuts(prevState => ([
      ...prevState,
      ["", "", id, ""]
    ]))
  }

  const handleDeleteShortcut = (id: string) => {
    var newArr = [...shortcuts]; // copying the old array
    setShortcuts(newArr.filter(entry => entry[2] != id));
  }

  const updateShortcuts = (index, url) => {
    var newArr = [...shortcuts]; // copying the old array
    newArr[index][1] = url;
    setShortcuts(newArr);
  }

  return (
    <HorizontallyCenteredLayout>
      <Formik
        initialValues={user}
        onSubmit={async ({ ...other }) => {
          const formData = new FormData();

          let blob: File | null;
          if (user.profile_picture && user.profile_picture != activeUser.profile_picture) {
            const ext = user.profile_picture.substring(user.profile_picture.lastIndexOf(".") + 1);
            blob = new File([await (await (await fetch(img)).blob()).arrayBuffer()], `profile-${user.id}.${ext}`, {
              type: "image/" + ext,
            });
          } else {
            blob = null;
          }
          if (blob) formData.append("profile_picture", blob);
          formData.append("first_name", other.first_name);
          formData.append("last_name", other.last_name);
          // if it's a string then just write the string
          formData.append(
            "date_of_birth",
            (other.date_of_birth as any) instanceof Date
              ? format((other.date_of_birth as unknown) as any, "yyyy-MM-dd")
              : other.date_of_birth
          );
          formData.append("id", String(id));
          formData.append("email", user.username);

          // Handle shortcut uploads
          let shortcutBlob: File | null;
          for (var i = 0; i < shortcuts.length; i++) {
            if (shortcuts[i][0] != "" && shortcuts[i][1] != "") {
              const extension = shortcuts[i][3];
              shortcutBlob = new File([await (await (await fetch(shortcuts[i][1])).blob()).arrayBuffer()], `shortcut-${shortcuts[i][0]}-${user.id}.${extension}`, {
                type: "image/" + extension,
              });
              const request = new FormData();
              request.append("file", shortcutBlob);
              const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/shortcutUpload/", request);
              updateShortcuts(i, response.data['url']);
            }
          }
          formData.append("shortcuts", JSON.stringify(shortcuts));

          axios.patch(process.env.NEXT_PUBLIC_API_URL + "/users/" + id + "/", formData).then((resp) => {
            const user = resp.data as User;
            if (user) setUser(user);
            router.push("/home");
          });
        }}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form>
            <Container component="main" maxWidth="sm">
              <Box className={classes.card}>
                <Typography className={classes.profileName} variant="h5">
                  {user.first_name} {user.last_name} ({user.username})
                </Typography>
                <AvatarPicker disabled={!isActiveUser} initialUrl={img} onSaveAvatar={handleSave} />
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <MyTextField
                      disabled={!isActiveUser}
                      readOnly={!isActiveUser}
                      placeholder="First Name"
                      label="First Name"
                      name="first_name"
                      autoFocus
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <MyTextField
                      disabled={!isActiveUser}
                      readOnly={!isActiveUser}
                      placeholder="Last Name"
                      label="Last Name"
                      name="last_name"
                    />
                  </Grid>
                </Grid>
                <Field
                  component={KeyboardDatePicker}
                  placeholder="Date of Birth"
                  validate={false}
                  required={false}
                  disabled={!isActiveUser}
                  readOnly={!isActiveUser}
                  label="Date of Birth"
                  name="date_of_birth"
                  format="dd/MM/yyyy"
                  value={values.date_of_birth}
                  onChange={(value: Date) => setFieldValue("date_of_birth", value)}
                /> 
                &nbsp;
                {
                  shortcuts.map((array, index) => ( 
                      <ShortcutCreator key={array[2]} id={array[2]} initialUrl={array[1]} initialShortcut={array[0]} index={index} onSave={ handleShortcutSave } onDelete={ handleDeleteShortcut }/>
                  ))
                }
                {
                  showAddButton ? <Button onClick={ handleAddShortcut }>Add shortcut</Button> : null
                }
                &nbsp;
                {isActiveUser ? (
                  <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                    Save
                  </Button>
                ) : (
                  <Button onClick={() => router.push("/home")} color="primary" variant="contained">
                    Go back to Home
                  </Button>
                )}
              </Box>
            </Container>
          </Form>
        )}
      </Formik>
    </HorizontallyCenteredLayout>
  );
};

export default UserDetails;
