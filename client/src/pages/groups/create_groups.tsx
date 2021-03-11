import { Avatar, Box, Button, Container, Typography } from "@material-ui/core";
import { ChatBubbleOutline } from "@material-ui/icons";
import axios from "axios";
import { MyTextField, useStyles } from "components/Common/FormikUI";
import { NavButtonLink } from "components/Common/Link";
import { Layout } from "components/Layout/Layout";
import { Form, Formik } from "formik";
import { SEARCH_GROUPS_PATH } from "util/constants";

const CreateGroup = () => {
    const classes = useStyles();
    return (
      <Layout>
        <Formik
          initialValues={{ group_name: "", users: []}}
          onSubmit={async (values) => {
            await axios.post("/api/groups", values);
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <Container component="main" maxWidth="sm">
                <Box className={classes.card}>
                  <Avatar>
                    <ChatBubbleOutline />
                  </Avatar>
                  <Typography variant="h5">Create a new group</Typography>
                  <MyTextField placeholder="Group Name" label="Group Name" name="group_name" autoFocus />
                  &nbsp;
                  <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                    Create Group
                  </Button>
                  &nbsp;
                  <NavButtonLink href={SEARCH_GROUPS_PATH} color="primary" variant="contained">
                    Cancel
                  </NavButtonLink>
                </Box>
              </Container>
            </Form>
          )}
        </Formik>
      </Layout>
    );
  };
  
  export default CreateGroup;
  