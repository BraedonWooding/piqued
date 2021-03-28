import {
  Avatar,
  Box,
  Button,
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
  TextField,
} from "@material-ui/core";
import { ExitToAppSharp, SearchRounded } from "@material-ui/icons";
import { ChatMsg } from "@mui-treasury/components/chatMsg";
import axios from "axios";
import clsx from "clsx";
import { EmojiPicker } from "components/Elements/EmojiPicker";
import { format } from "date-fns";
import { useRouter } from "next/router";
import React, { DragEvent, FC, useEffect, useRef, useState } from "react";
//@ts:ignore
import SendLogo from "react-svg-loader!assets/icons/send.svg";
import { ChatMsg as ChatMsgType, Group, User } from "types";
import { popToken } from "util/auth/token";
import { popUser } from "util/auth/user";
import { LOGIN_PATH, SEARCH_GROUPS_PATH } from "util/constants";
import { EditDeleteChatMsgButton } from "./EditDeleteChatMsgButton";
import { FileStatusBar } from "./FileStatusBar";
import { MediaRender } from "./MediaRender";

//let delete_endpoint = '${process.env.NEXT_PUBLIC_WS_URL} + /delete/';
//let edit_endpoint = "http://127.0.0.1:8000/delete/";

interface ChatProps {
  activeUser: User;
}

export const Chat: FC<ChatProps> = ({ activeUser }) => {
  const classes = useStyles();
  const router = useRouter();

  const [userGroups, setUserGroups] = useState<Group[]>(activeUser.groups);
  const [chatMsges, setChatMsges] = useState<ChatMsgType[]>([]);
  const [message, setMessage] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(
    activeUser.groups.length > 0 ? activeUser.groups[0] : null
  );
  const chatMsgesRef = useRef(chatMsges);
  const [deactive, setDeactive] = useState(false);
  const [retry, setRetry] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef(null);
  const username = activeUser.first_name + " " + activeUser.last_name;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const validateFile = (file: File) => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (validTypes.indexOf(file.type) === -1) return false;
    return true;
  };

  const fileDrop = (e: DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    for (let i = 0; i < files.length; i++) if (validateFile(files[i])) setSelectedFiles([...selectedFiles, files[i]]);
  };

  const uploadFiles = async () => {
    const urls: String[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append("file", selectedFiles[i]);
      formData.append("name", currentGroup.name);
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/upload/", formData);
      urls.push(response.data["url"]);
    }
    // Only handle single files for now
    if (urls.length === 1) return urls[0];
    return "";
  };

  // Connects to the websocket and refreshes content on first render only
  useEffect(() => {
    if (!currentGroup) return;

    if (chatSocket) {
      chatSocket.onclose = () => {};
      chatSocket.close();
    }

    setRetry(false);
    const newChatSocket = new WebSocket(
      `ws://${process.env.NEXT_PUBLIC_WS_URL}/ws/messaging/${currentGroup.id}/${activeUser.id}/`
    );

    newChatSocket.onopen = () => {
      setDeactive(false);
      if (timer) clearInterval(timer);
      setTimer(null);
      chatMsgesRef.current = [];
      setChatMsges([]);
    };

    newChatSocket.onclose = () => {
      // the websocket was closed this was probably due to a dropped internet connection
      // we should do a retry loop!
      setDeactive(true);
      if (timer) clearInterval(timer);
      setTimer(
        setInterval(() => {
          setRetry(true);
        }, 2000)
      );
    };

    newChatSocket.onmessage = (e) => {
      const { message, files, userId, timestamp, rowKey, partitionKey, seen } = JSON.parse(e.data);
      chatMsgesRef.current.push({ message, files, userId, timestamp: new Date(timestamp), rowKey, partitionKey, seen });
      // fix the cases when we get them out of time
      chatMsgesRef.current.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      setChatMsges([...chatMsgesRef.current]);
      lastMessageRef.current.scrollIntoView({ behaviour: "smooth" });
    };
    setChatSocket(newChatSocket);

    // when the component drops close the socket
    return () => {
      newChatSocket.onclose = undefined;
      newChatSocket.close();
    };
  }, [currentGroup, retry]);

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xs={3} className={classes.borderRight500}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={5}>
            <List>
              <ListItem button onClick={() => router.push("/user/details/" + activeUser.id)}>
                <ListItemIcon>
                  <Avatar alt={username} src={activeUser.profile_picture} />
                </ListItemIcon>
                <ListItemText primary={username} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={7}>
            <Button
              onClick={() => {
                router.push(SEARCH_GROUPS_PATH);
              }}
              color="primary"
              variant="contained"
            >
              <SearchRounded />
              Search
            </Button>
            &nbsp;
            <Button
              onClick={() => {
                popUser();
                popToken();
                router.push(LOGIN_PATH);
              }}
              color="primary"
              variant="contained"
            >
              Logout
            </Button>
          </Grid>
        </Grid>
        <Divider />
        <List className={classes.userList}>
          {userGroups.map((group, index) => (
            <ListItem
              disabled={deactive}
              className={clsx({ [classes.currentGroup]: group === currentGroup })}
              button
              key={"Group-" + group.id}
              onClick={() => {
                setCurrentGroup(group);
              }}
            >
              <ListItemText primary={group.name} />
              {group === currentGroup ? (
                <Button
                  className={classes.slimButton}
                  onClick={async () => {
                    await axios.delete(process.env.NEXT_PUBLIC_API_URL + "/groups/" + group.id + "/remove_user/");
                    userGroups.splice(index, 1);
                    setUserGroups(userGroups);
                    setCurrentGroup(userGroups.length > 0 ? userGroups[0] : null);
                  }}
                >
                  <ExitToAppSharp />
                  Leave
                </Button>
              ) : null}
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={8}>
        <List className={classes.messageArea}>
          {chatMsges.map((chatMsg, index) => {
            const isActiveUser = chatMsg.userId === activeUser.id;
            return (
              <ListItem key={index}>
                <Grid container>
                  <Grid item xs={12}>
                    {chatMsg.message !== "" && (
                      <ChatMsg side={isActiveUser ? "right" : "left"} messages={[chatMsg.message]} />
                    )}
                    <MediaRender url={chatMsg.files} isRight={isActiveUser ? true : false} />
                    <Grid container>
                      <Grid item xs={12}>
                        <List className={clsx({ [classes.alignSelfRight]: isActiveUser })}>
                          <Box display="flex">
                            <ListItem className={clsx({ [classes.alignSelfRight]: isActiveUser })}>
                              <ListItemText
                                className={clsx({ [classes.alignSelfRight]: isActiveUser })}
                                style={{ width: "100px" }}
                                secondary={
                                  (currentGroup && chatMsg.seen.split(" ").length === currentGroup.user_set.length
                                    ? "✓ "
                                    : "✓✓ ") + format(chatMsg.timestamp, "h:mm aa")
                                }
                              />
                            </ListItem>
                            {isActiveUser && (
                              <EditDeleteChatMsgButton
                                initialMessage={chatMsg.message}
                                onEdit={async (changedMessage) => {
                                  const { rowKey, partitionKey } = chatMsg;
                                  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/edit/`, {
                                    rowKey,
                                    partitionKey,
                                    message: changedMessage,
                                  });

                                  if (response.data.status === "Edited") {
                                    const i = chatMsgesRef.current.findIndex((obj) => obj.rowKey == rowKey);
                                    chatMsgesRef.current[i].message = changedMessage;
                                    setChatMsges([...chatMsgesRef.current]);
                                  }
                                }}
                                onDelete={async () => {
                                  const { rowKey, partitionKey } = chatMsg;
                                  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/delete/`, {
                                    rowKey,
                                    partitionKey,
                                  });
                                  if (response.data.status === "Deleted") {
                                    const i = chatMsgesRef.current.findIndex((obj) => obj.rowKey == rowKey);
                                    chatMsgesRef.current[i].message = "[MESSAGE DELETED]";
                                    chatMsgesRef.current[i].files = "";
                                    setChatMsges([...chatMsgesRef.current]);
                                  }
                                }}
                              />
                            )}
                          </Box>
                        </List>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </ListItem>
            );
          })}
          <ListItem ref={lastMessageRef} />
        </List>
        <Divider />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const files = await uploadFiles();
            if (message !== "" || files !== "") {
              const el = document.querySelector("#send-logo") as HTMLElement;
              el.classList.add(classes.fly);
              setTimeout(() => el.classList.remove(classes.fly), 2000);

              // Idk if there is a better way.
              chatSocket.send(
                JSON.stringify({
                  userId: activeUser.id,
                  files,
                  message,
                  timestamp: new Date(),
                })
              );
              setMessage("");
              setSelectedFiles([]);
            }
          }}
        >
          {currentGroup && (
            <Grid container className={classes.chatBox}>
              <Grid item xs={12}>
                <TextField
                  placeholder="Type something"
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onDragOver={(e: React.DragEvent<HTMLInputElement>) => e.preventDefault()}
                  onDragEnter={(e: React.DragEvent<HTMLInputElement>) => e.preventDefault()}
                  onDragLeave={(e: React.DragEvent<HTMLInputElement>) => e.preventDefault()}
                  onDrop={fileDrop}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <EmojiPicker setMessage={(emoji) => setMessage(message + emoji)} />
                        <IconButton disabled={deactive} type="submit" color="inherit">
                          <SendLogo id="send-logo" width={25} height={25} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <FileStatusBar
                files={selectedFiles}
                removeFile={(file) => setSelectedFiles(selectedFiles.filter((selectedFile) => selectedFile !== file))}
              />
            </Grid>
          )}
        </form>
      </Grid>
      <Grid item xs={1} className={classes.borderLeft500}>
        <List className={classes.userList}>
          {currentGroup &&
            currentGroup.user_set.map((user) => (
              <ListItem>
                <ListItemIcon>
                  <Avatar alt={user.first_name} src={user.profile_picture} />
                </ListItemIcon>
                <ListItemText primary={user.first_name + " " + user.last_name} />
              </ListItem>
            ))}
        </List>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(() => ({
  chatSection: { width: "100%", height: "100vh" },
  headBG: { backgroundColor: "#e0e0e0" },
  borderRight500: { borderRight: "1px solid #e0e0e0" },
  borderLeft500: { borderLeft: "1px solid #e0e0e0" },
  userList: { height: "80vh", overflowY: "auto" },
  messageArea: { height: "90vh", overflowY: "auto" },
  alignSelfRight: { textAlign: "right" },
  searchBox: { padding: 10 },
  chatBox: { padding: 20 },
  currentGroup: {
    border: "2px solid black",
  },
  hide: { visibility: "hidden" },
  slimButton: { padding: 5 },
  fly: {
    position: "absolute",
    animation: "$message-fly 2s ease-in",
    animationDelay: "0s",
    zIndex: 10,
  },
  "@keyframes message-fly": {
    "0%": {},
    "25%": { transform: "rotate(-90deg)" },
    "100%": { transform: "rotate(-120deg) translate(1000px)", display: "none" },
  },
}));

export default Chat;
