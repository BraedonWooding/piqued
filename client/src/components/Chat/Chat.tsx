import {
  Avatar,
  Badge,
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
  TextField
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
import { ChatMsg as ChatMsgType, Group, MessageType, Status, User } from "types";
import { popToken } from "util/auth/token";
import { popUser } from "util/auth/user";
import { LOGIN_PATH, SEARCH_GROUPS_PATH } from "util/constants";
import { EditDeleteChatMsgButton } from "./EditDeleteChatMsgButton";
import { FileStatusBar } from "./FileStatusBar";
import { MediaRender } from "./MediaRender";

interface ChatProps {
  activeUser: User;
}

export const Chat: FC<ChatProps> = ({ activeUser }) => {
  const classes = useStyles();
  const router = useRouter();

  const [userGroups, setUserGroups] = useState<Group[]>(activeUser.groups);
  const [chatMsges, setChatMsges] = useState<ChatMsgType[]>([]);
  const [message, setMessage] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket>(null);
  const [currentGroup, setCurrentGroup] = useState<Group>(activeUser.groups.length > 0 ? activeUser.groups[0] : null);
  const chatMsgesRef = useRef(chatMsges);
  const userGroupsRef = useRef(userGroups);
  const currentGroupRef = useRef(currentGroup);
  const [deactive, setDeactive] = useState(false);
  const [retry, setRetry] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const lastMessageRef = useRef<HTMLDivElement>();
  const username = `${activeUser.first_name} ${activeUser.last_name}`;
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
    const urls: string[] = [];
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
    if (!currentGroupRef.current) return;
    else if (!chatSocket) {
      setRetry(false);
      const newChatSocket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_URL}/ws/messaging/${activeUser.id}/`);

      newChatSocket.onopen = () => {
        setDeactive(false);
        if (timer) clearInterval(timer);
        setTimer(null);
        chatMsgesRef.current = [];
        setChatMsges([...chatMsgesRef.current]);
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
        const parsedData = JSON.parse(e.data);

        // Update seen status after history messages have been loaded
        if (parsedData.type === MessageType.GET_HISTORY) {
          parsedData.messages.forEach((m) => {
            const { partitionKey, rowKey, message, files, userId, createdAt, seen } = m;

            chatMsgesRef.current.push({
              partitionKey,
              rowKey,
              message,
              files,
              userId,
              seen,
              createdAt: new Date(createdAt),
            });
          });

          setChatMsges([...chatMsgesRef.current]);
        } else if (parsedData.type === MessageType.CHAT_MESSAGE) {
          const { partitionKey, rowKey, message, files, userId, createdAt, seen } = parsedData;

          if (partitionKey === currentGroupRef.current.id.toString()) {
            chatMsgesRef.current.push({
              partitionKey,
              rowKey,
              message,
              files,
              userId,
              seen,
              createdAt: new Date(createdAt),
            });
            // fix the cases when we get them out of time
            chatMsgesRef.current.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            setChatMsges([...chatMsgesRef.current]);
            lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
          } else {
            // handle notification for message being sent to another group
            const group = userGroupsRef.current.find((g) => g.id.toString() === partitionKey);
            if (
              group &&
              !group.has_unseen_messages &&
              !(seen as string).split(" ").includes(activeUser.id.toString())
            ) {
              group.has_unseen_messages = true;
              setUserGroups([...userGroupsRef.current]);
            }
          }
        } else if (parsedData.type === MessageType.SEEN_MESSAGE) {
          const { partitionKey, rowKey, seen } = parsedData;
          const message = chatMsgesRef.current.find(
            (msg) => msg.partitionKey === partitionKey && msg.rowKey === rowKey
          );

          if (message) {
            message.seen = seen;
            setChatMsges([...chatMsgesRef.current]);
          }
        } else if (parsedData.type === MessageType.STATUS_UPDATE) {
          const { status, userId } = parsedData;

          for (let i = 0; i < userGroupsRef.current.length; i++) {
            const user = userGroupsRef.current[i].user_set.find((u) => u.id === Number(userId));
            if (user) {
              user.status = status;
              setUserGroups([...userGroupsRef.current]);
            }
          }
        }
      };

      setChatSocket(newChatSocket);
    }
  }, [currentGroupRef.current, retry]);

  // Get history of chat after chatsocket has connected
  useEffect(() => {
    if (chatSocket?.readyState) {
      chatSocket.send(
        JSON.stringify({
          type: MessageType.GET_HISTORY,
          partitionKey: currentGroupRef.current.id.toString(),
        })
      );

      return () => {
        chatMsgesRef.current = [];
        setChatMsges([...chatMsgesRef.current]);
      };
    }
    return;
  }, [chatSocket?.readyState, currentGroupRef.current]);

  // Update seen status after chat messages have been loaded
  useEffect(() => {
    if (chatSocket?.readyState) {
      chatMsgesRef.current.forEach((chatMsg) => {
        const { partitionKey, rowKey, seen } = chatMsg;
        if (!(seen as string).split(" ").includes(activeUser.id.toString()))
          chatSocket.send(
            JSON.stringify({
              type: MessageType.SEEN_MESSAGE,
              partitionKey,
              rowKey,
              seen: `${seen} ${activeUser.id}`,
            })
          );
      });
    }
  }, [chatSocket?.readyState, chatMsges]);

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xs={3} className={classes.borderRight500}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={5}>
            <List>
              <ListItem button onClick={() => router.push("/user/details/" + activeUser.id)}>
                <ListItemIcon>
                  <Badge
                    overlap="circle"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    color="secondary"
                    variant="dot"
                  >
                    <Avatar alt={username} src={activeUser.profile_picture} />
                  </Badge>
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
              key={"Group-" + group.id}
              disabled={deactive}
              className={clsx({ [classes.currentGroup]: group.id === currentGroup.id })}
              button
              onClick={() => {
                group.has_unseen_messages = false;
                currentGroupRef.current = group;
                setUserGroups([...userGroupsRef.current]);
                setCurrentGroup({ ...currentGroupRef.current });
              }}
            >
              <ListItemText
                primary={
                  <>
                    {group.name}
                    &nbsp; &nbsp;
                    {group.has_unseen_messages && <Badge color="error" variant="dot" />}
                  </>
                }
              />
              {group.id === currentGroup.id ? (
                <Button
                  className={classes.slimButton}
                  onClick={async () => {
                    await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/groups/${group.id}/remove_user/`);
                    userGroupsRef.current.splice(index, 1);
                    setUserGroups([...userGroupsRef.current]);
                    setCurrentGroup(
                      userGroupsRef.current.length > 0
                        ? { ...userGroupsRef.current[0], has_unseen_messages: false }
                        : null
                    );
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
                                    ? "✓✓"
                                    : "✓") + format(chatMsg.createdAt, "h:mm aa")
                                }
                              />
                            </ListItem>
                            {isActiveUser && (
                              <EditDeleteChatMsgButton
                                initialMessage={chatMsg.message}
                                onEdit={async (changedMessage) => {
                                  const { rowKey, partitionKey } = chatMsg;
                                  const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/edit/`, {
                                    partitionKey,
                                    rowKey,
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
          <div ref={lastMessageRef} />
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

              chatSocket.send(
                JSON.stringify({
                  type: MessageType.CHAT_MESSAGE,
                  message,
                  files,
                  partitionKey: currentGroup.id.toString(),
                  userId: activeUser.id,
                  seen: activeUser.id.toString(),
                  createdAt: new Date(),
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
            currentGroup.user_set.map(
              (user, index) =>
                user.id !== activeUser.id && (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Badge
                        overlap="circle"
                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                        color={user.status === Status.ONLINE ? "secondary" : "error"}
                        variant="dot"
                      >
                        <Avatar alt={user.first_name} src={user.profile_picture} />
                      </Badge>
                    </ListItemIcon>
                    <ListItemText primary={username} />
                  </ListItem>
                )
            )}
        </List>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles((theme) => ({
  chatSection: { width: "100%", height: "100vh" },
  headBG: { backgroundColor: "#e0e0e0" },
  borderRight500: { borderRight: "1px solid #e0e0e0" },
  borderLeft500: { borderLeft: "1px solid #e0e0e0" },
  userList: { height: "80vh", overflowY: "auto" },
  messageArea: { height: "90vh", overflowY: "auto" },
  alignSelfRight: { textAlign: "right" },
  searchBox: { padding: 10 },
  chatBox: { padding: 20 },
  currentGroup: { border: "2px solid black" },
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
