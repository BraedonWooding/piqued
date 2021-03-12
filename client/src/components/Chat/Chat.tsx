import {
  Avatar,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Paper,
  TextField
} from "@material-ui/core";
import { Send } from "@material-ui/icons";
import { ChatMsg } from "@mui-treasury/components/chatMsg";
import clsx from "clsx";
import { format } from "date-fns";
import { FC, useEffect, useRef, useState } from "react";

interface ChatProps {
  activeUserId: number;
  activeUsername: string;
  groupId: number;
  groupName: string
}

interface IChatMsg {
  message: string;
  userId: number;
  timestamp: Date;
}

export const Chat: FC<ChatProps> = ({ activeUserId, activeUsername, groupId, groupName }) => {
  const classes = useStyles();
  const [chatMsges, setChatMsges] = useState<IChatMsg[]>([]);
  const [message, setMessage] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const chatMsgesRef = useRef(chatMsges);

  // Connects to the websocket and refreshes content on first render only
  useEffect(() => {
    const newChatSocket = new WebSocket(`ws://127.0.0.1:8000/ws/messaging/${groupId}/`);
    newChatSocket.onmessage = (e) => {
      const { message, userId, timestamp } = JSON.parse(e.data);
      chatMsgesRef.current.push({ message, userId, timestamp: new Date(timestamp) });
      setChatMsges([...chatMsgesRef.current]);
    };
    newChatSocket.onclose = (e) => console.error("Chat socket closed unexpectedly");
    setChatSocket(newChatSocket);
    return newChatSocket.close;
  }, []);

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xs={3} className={classes.borderRight500}>
        <List>
          <ListItem button>
            <ListItemIcon>
              <Avatar alt="Remy Sharp" src="https://material-ui.com/static/images/avatar/1.jpg" />
            </ListItemIcon>
            <ListItemText primary={activeUsername} />
          </ListItem>
        </List>
        <Divider />
        <Grid item xs={12} className={classes.searchBox}>
          <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth />
        </Grid>
        <Divider />
        <List className={classes.userList}>
          {/* placeholders */}
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
                <Grid item xs={12}>
                  <ChatMsg side={chatMsg.userId === activeUserId ? "right" : "left"} messages={[chatMsg.message]} />
                  <ListItemText
                    className={clsx({ [classes.alignSelfRight]: chatMsg.userId === activeUserId })}
                    secondary={format(chatMsg.timestamp, "h:mm aa")}
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
            if (message !== "") {
              chatSocket.send(
                JSON.stringify({
                  userId: activeUserId,
                  message,
                  timestamp: new Date(),
                })
              );
              setMessage("");
            }
          }}
        >
          <Grid container className={classes.chatBox}>
            <Grid item xs={12}>
              <TextField
                placeholder="Type something"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" color="inherit">
                        <Send />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </form>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  chatSection: { width: "100%", height: "100vh" },
  headBG: { backgroundColor: "#e0e0e0" },
  borderRight500: { borderRight: "1px solid #e0e0e0" },
  userList: { height: "80vh", overflowY: "auto" },
  messageArea: { height: "90vh", overflowY: "auto" },
  alignSelfRight: { textAlign: "right" },
  searchBox: { padding: 10 },
  chatBox: { padding: 20 },
}));

export default Chat;
