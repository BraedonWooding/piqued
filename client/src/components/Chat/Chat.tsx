import {
  Avatar,
  Divider,
  Fab,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  TextField,
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import clsx from "clsx";
import { format } from "date-fns";
import { FC, useEffect, useState } from "react";

interface ChatProps {
  activeUser: number;
  groupId: number;
}

interface ChatMsg {
  message: string;
  userId: number;
  timestamp: Date;
}

export const Chat: FC<ChatProps> = ({ activeUser, groupId = 0 }) => {
  const classes = useStyles();
  const [chatMsges, setChatMsges] = useState<ChatMsg[]>([]);
  const [message, setMessage] = useState("");
  let chatSocket: WebSocket;

  // Connects to the websocket and refreshes content on first render only
  useEffect(() => {
    chatSocket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_BASE_URL}/ws/messaging/${groupId}/`);
    chatSocket.onmessage = (e) => setChatMsges([...chatMsges, JSON.parse(e.data)]);
    chatSocket.onclose = (e) => console.error("Chat socket closed unexpectedly");
    return chatSocket.close;
  }, []);

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xs={3} className={classes.borderRight500}>
        <List>
          <ListItem button>
            <ListItemIcon>
              <Avatar alt="Remy Sharp" src="https://material-ui.com/static/images/avatar/1.jpg" />
            </ListItemIcon>
            <ListItemText primary="John Wick" />
          </ListItem>
        </List>
        <Divider />
        <Grid item xs={12} className={classes.searchBox}>
          <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth />
        </Grid>
        <Divider />
        <List>
          <ListItem button key="RemySharp">
            <ListItemIcon>
              <Avatar alt="Remy Sharp" src="https://material-ui.com/static/images/avatar/1.jpg" />
            </ListItemIcon>
            <ListItemText primary="Remy Sharp" />
            <ListItemText secondary="online" />
          </ListItem>
          <ListItem button key="Alice">
            <ListItemIcon>
              <Avatar alt="Alice" src="https://material-ui.com/static/images/avatar/3.jpg" />
            </ListItemIcon>
            <ListItemText primary="Alice" />
          </ListItem>
          <ListItem button key="CindyBaker">
            <ListItemIcon>
              <Avatar alt="Cindy Baker" src="https://material-ui.com/static/images/avatar/2.jpg" />
            </ListItemIcon>
            <ListItemText primary="Cindy Baker" />
          </ListItem>
        </List>
      </Grid>
      <Grid item xs={9}>
        <List className={classes.messageArea}>
          {chatMsges.map((chatMsg, index) => (
            <ListItem key={index}>
              <Grid container>
                <Grid item xs={6}>
                  <ListItemText
                    className={clsx({ [classes.alignSelfRight]: chatMsg.userId === activeUser })}
                    primary={chatMsg.message}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ListItemText
                    className={clsx({ [classes.alignSelfRight]: chatMsg.userId === activeUser })}
                    secondary={format(chatMsg.timestamp, "hh:mm a..aa")}
                  />
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
        <Divider />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (message !== "")
              chatSocket.send(
                JSON.stringify({
                  userId: activeUser,
                  message,
                  timestamp: Date.now(),
                })
              );
          }}
        >
          <Grid container className={classes.chatBox}>
            <Grid item xs={11}>
              <TextField placeholder="Type something" fullWidth required onChange={(e) => setMessage(e.target.value)} />
            </Grid>
            <Grid item xs={1}>
              <Fab type="submit" color="primary" aria-label="send">
                <Send />
              </Fab>
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  table: { minWidth: 650 },
  chatSection: { width: "100%", height: "80vh" },
  headBG: { backgroundColor: "#e0e0e0" },
  borderRight500: { borderRight: "1px solid #e0e0e0" },
  messageArea: { height: "70vh", overflowY: "auto" },
  alignSelfRight: { alignSelf: "right" },
  searchBox: { padding: 10 },
  chatBox: { padding: 20 },
}));

export default Chat;
