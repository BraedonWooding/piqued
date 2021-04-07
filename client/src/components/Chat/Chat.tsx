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
  TextField,
} from "@material-ui/core";
import { ExitToAppSharp, SearchRounded } from "@material-ui/icons";
import axios from "axios";
import clsx from "clsx";
import { EmojiPicker } from "components/Elements/EmojiPicker";
import { GifPicker } from "components/Elements/GifPicker";
import { format } from "date-fns";
import { useRouter } from "next/router";
import React, { DragEvent, FC, useEffect, useRef, useState } from "react";
import Measure from "react-measure";
//@ts:ignore
import SendLogo from "react-svg-loader!assets/icons/send.svg";
import { ChatMsg as ChatMsgType, Group, MessageType, Status, User } from "types";
import { popToken } from "util/auth/token";
import { popUser } from "util/auth/user";
import { LOGIN_PATH, SEARCH_GROUPS_PATH } from "util/constants";
import { removeToken } from "../../firebase";
import { ChatMessage } from "./ChatMessage";
import { FileStatusBar } from "./FileStatusBar";
import { MuteButton } from "./MuteButton";
import { ScrollableMsgs } from "./ScrollableMsgs";

interface ChatProps {
  activeUser: User | null;
}

export const Chat: FC<ChatProps> = ({ activeUser }) => {
  const classes = useStyles();
  const router = useRouter();
  const [userGroups, setUserGroups] = useState<Group[]>(activeUser.groups);
  const [chatMsgs, setChatMsgs] = useState<ChatMsgType[]>([]);
  const [message, setMessage] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket>(null);
  const [currentGroup, setCurrentGroup] = useState<Group>(activeUser.groups.length > 0 ? activeUser.groups[0] : null);
  const chatMsgsRef = useRef(chatMsgs);
  const userGroupsRef = useRef(userGroups);
  const currentGroupRef = useRef(currentGroup);
  const scrollableRef = useRef<Measure>();
  const [deactive, setDeactive] = useState(false);
  const [retry, setRetry] = useState(false);
  const [groupHover, setGroupHover] = useState(null); // Stores index of hovered group

  const handleGroupHover = (index) => {
    setGroupHover(index);
  };
  const handleGroupLeave = () => {
    setGroupHover(null);
  };
  const [timer, setTimer] = useState<NodeJS.Timeout>(null);
  const username = `${activeUser.first_name} ${activeUser.last_name}`;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [chunkedMsgs, setChunkedMsgs] = useState<[User, ChatMsgType[]][]>([]);
  const [currentUsers, setCurrentUsers] = useState<string[]>([]);

  const fileDrop = (e: DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    setSelectedFiles([...selectedFiles, ...Array.from(files)]);
  };

  const uploadFiles = async () => {
    const urls: { url: string; type: string }[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append("file", selectedFiles[i]);
      formData.append("group_id", String(currentGroup.id));
      const response = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/upload/", formData);
      urls.push(response.data);
    }
    return urls;
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
        chatMsgsRef.current = [];
        setChatMsgs([...chatMsgsRef.current]);
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
          const chatMsgList: ChatMsgType[] = [];
          parsedData.messages.forEach((m: ChatMsgType) => {
            const { partitionKey, rowKey, message, files, userId, seen, createdAt } = m;
            chatMsgList.push({
              partitionKey,
              rowKey,
              message,
              // @HACK: Backward support for single files
              files:
                typeof files === "string" && (files as string).includes("[")
                  ? JSON.parse(files)
                  : [{ url: (files as unknown) as string }].filter((f) => f && f.url && f.url.trim()),
              userId,
              seen,
              createdAt: new Date(createdAt),
            });
          });

          // fix the cases when we get them out of time
          chatMsgList.sort((a: ChatMsgType, b: ChatMsgType) => a.createdAt.getTime() - b.createdAt.getTime());
          chatMsgsRef.current = chatMsgsRef.current.concat(chatMsgList);
          setChatMsgs([...chatMsgsRef.current]);
        } else if (parsedData.type === MessageType.CHAT_MESSAGE) {
          const { partitionKey, rowKey, message, files, userId, seen, createdAt } = parsedData;

          if (partitionKey === currentGroupRef.current.id.toString()) {
            chatMsgsRef.current.push({
              partitionKey,
              rowKey,
              message,
              // @HACK: Backward support for single files
              files:
                typeof files === "string" && (files as string).includes("[")
                  ? JSON.parse(files)
                  : [{ url: (files as unknown) as string }].filter((f) => f && f.url && f.url.trim()),
              userId,
              seen,
              createdAt: new Date(createdAt),
            });

            // fix the cases when we get them out of time
            chatMsgsRef.current.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
            setChatMsgs([...chatMsgsRef.current]);
          } else {
            // handle notification for message being sent to another group
            const group = userGroupsRef?.current?.find((g) => g.id.toString() === partitionKey);
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
          // we only care if it's the last message
          const lastMessage = chatMsgsRef.current[chatMsgsRef.current.length - 1];

          if (lastMessage.partitionKey === partitionKey && lastMessage.rowKey === rowKey) {
            lastMessage.seen = seen;
            setChatMsgs([...chatMsgsRef.current]);
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
  }, [currentGroup, retry]);

  // Get history of chat after chatsocket has connected
  useEffect(() => {
    if (chatSocket?.readyState) {
      chatSocket.send(
        JSON.stringify({
          type: MessageType.GET_HISTORY,
          partitionKey: currentGroupRef.current.id.toString(),
        })
      );

      setCurrentUsers([...currentGroupRef.current.user_set.map((u) => String(u.id))]);

      return () => {
        chatMsgsRef.current = [];
        setChatMsgs([...chatMsgsRef.current]);
      };
    }
    return;
  }, [chatSocket?.readyState, currentGroupRef.current]);

  // Update seen status of last message after chat messages have been loaded
  useEffect(() => {
    if (chatSocket?.readyState && chatMsgsRef.current.length > 0) {
      const { partitionKey, rowKey, seen } = chatMsgsRef.current[chatMsgsRef.current.length - 1];
      if (!(seen as string).split(" ").includes(activeUser.id.toString()))
        chatSocket.send(
          JSON.stringify({
            type: MessageType.SEEN_MESSAGE,
            partitionKey,
            rowKey,
            seen: `${seen} ${activeUser.id}`,
          })
        );
    }
  }, [chatSocket?.readyState, chatMsgsRef.current]);

  useEffect(() => {
    // chunk msgs together if sent within a minute from the same person
    // write the profile picture in there as well
    if (currentGroup) {
      const user_map = {};
      currentGroup.user_set.map((u) => (user_map[u.id] = u));
      var current_msg_set: ChatMsgType[] = [];
      var newest_msg: null | ChatMsgType = null;
      var all_msgs: [User, ChatMsgType[]][] = [];
      chatMsgs.map((m) => {
        if (
          newest_msg === null ||
          (m.userId === newest_msg.userId && (m.createdAt.getTime() - newest_msg.createdAt.getTime()) / 1000 < 60)
        ) {
          // if over same minute
          current_msg_set.push(m);
          newest_msg = m;
        } else {
          all_msgs.push([user_map[newest_msg.userId] || null, [...current_msg_set]]);
          current_msg_set = [m];
          newest_msg = m;
        }
      });
      if (current_msg_set.length > 0) all_msgs.push([user_map[newest_msg.userId] || null, [...current_msg_set]]);

      setChunkedMsgs(all_msgs);
    }
  }, [currentGroupRef.current, chatMsgs]);

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xl={2} md={3} lg={2} xs={3} sm={3} className={classes.borderRight500}>
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
          <Grid item xs={7} style={{ textAlign: "right", paddingRight: "10px" }}>
            <Button
              style={{ maxWidth: "70%" }}
              onClick={() => {
                router.push(SEARCH_GROUPS_PATH);
              }}
              color="primary"
              variant="text"
            >
              <SearchRounded />
              Search
            </Button>
          </Grid>
        </Grid>
        <Divider />
        <List className={classes.userList}>
          {userGroups.map(
            (group, index) =>
              (!group.expired_at || Date.now() > group.expired_at.getTime()) && (
                <ListItem
                  onMouseOver={(e) => handleGroupHover(index)}
                  onMouseLeave={(e) => handleGroupLeave()}
                  key={"Group-" + group.id}
                  disabled={deactive}
                  className={clsx({ [classes.currentGroup]: group.id === currentGroup.id })}
                  button
                  onClick={() => {
                    setCurrentGroup(group);
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
                  {groupHover === index ? <MuteButton userId={activeUser.id} groupId={group.id} /> : null}
                </ListItem>
              )
          )}
        </List>
      </Grid>
      <Grid
        item
        xl={8}
        md={7}
        lg={7}
        sm={6}
        onDragOver={(e: React.DragEvent<HTMLInputElement>) => e.preventDefault()}
        onDragEnter={(e: React.DragEvent<HTMLInputElement>) => e.preventDefault()}
        onDragLeave={(e: React.DragEvent<HTMLInputElement>) => e.preventDefault()}
        onDrop={fileDrop}
      >
        <List style={{ paddingTop: 0 }} className={classes.messageArea}>
          <ScrollableMsgs ref={scrollableRef}>
            {(() => {
              const lastSeenSet = chatMsgs[chatMsgs.length - 1]?.seen.split(" ") || [];
              const lastSeen = currentUsers.every((i) => lastSeenSet.includes(i));
              let earliestSeenMsg: number | null = null;
              let lastSeenUsers = "Seen by ";

              if (currentGroup) {
                const lastSeenSetUsers = currentGroup.user_set
                  .filter((x) => x.id != activeUser.id && lastSeenSet.includes(String(x.id)))
                  .map((x) => x.first_name);
                lastSeenUsers += Array.from(new Set(lastSeenSetUsers)).slice(0, 3).join(", ");
                if (lastSeenSetUsers.length == 0) {
                  lastSeenUsers = "Sent";
                } else if (lastSeenSetUsers.length == currentGroup.user_set.length) {
                  lastSeenUsers = "Seen by everyone";
                } else if (lastSeenSetUsers.length > 3) {
                  lastSeenUsers += `and ${lastSeenSetUsers.length - 3} others`;
                }
              }

              if (!lastSeen) {
                // hasn't been seen by all members so we should show the previous message that has
                for (let i = chunkedMsgs.length - 2; i >= 0; i--) {
                  let [_, chatMsgs] = chunkedMsgs[i];
                  const msg = chatMsgs.find((x) => {
                    const users = x.seen?.split(" ") || [];
                    return currentUsers.every((i) => users.includes(i));
                  });
                  if (msg) {
                    earliestSeenMsg = i;
                    break;
                  }
                }
              }

              return chunkedMsgs.map(([user, chatMsgs], index) => {
                const isActiveUser = user?.id === activeUser.id;
                let seen: string = "";
                if (index == chunkedMsgs.length - 1) seen = (lastSeen ? "✓✓ " : "✓ ") + `${lastSeenUsers} `;
                else if (index == earliestSeenMsg) seen = "✓✓ " + `Seen by everyone `;

                return (
                  <ListItem key={index}>
                    <Grid container>
                      <Grid item xs={12}>
                        <ChatMessage
                          msgs={chatMsgs}
                          user={user}
                          side={isActiveUser ? "right" : "left"}
                          // :( it does exist they just have bad type script files
                          onMediaLoad={() => (scrollableRef.current as any).measure()}
                          onMessageChanged={async (type, msg, modification) => {
                            const { rowKey, partitionKey } = msg;
                            if (type == "edited") {
                              const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/edit/`, {
                                partitionKey,
                                rowKey,
                                message: modification,
                              });
                              if (response.data.status === "Edited") {
                                msg.message = modification;
                                setChatMsgs([...chatMsgsRef.current]);
                              }
                            } else if (type == "deleted") {
                              const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/delete/`, {
                                rowKey,
                                partitionKey,
                              });
                              if (response.data.status === "Deleted") {
                                const i = chatMsgsRef.current.findIndex((obj) => obj.rowKey == rowKey);
                                chatMsgsRef.current.splice(i, 1);
                                setChatMsgs([...chatMsgsRef.current]);
                              }
                            }
                          }}
                        />
                        <List className={clsx({ [classes.alignSelfRight]: isActiveUser })}>
                          <Box display="flex">
                            <ListItem
                              style={{ padding: 0 }}
                              className={clsx({ [classes.alignSelfRight]: isActiveUser })}
                            >
                              {
                                <ListItemText
                                  className={clsx({ [classes.alignSelfRight]: isActiveUser }, classes.name)}
                                  secondary={seen + format(chatMsgs[chatMsgs.length - 1].createdAt, "h:mm aa")}
                                />
                              }
                            </ListItem>
                          </Box>
                        </List>
                      </Grid>
                    </Grid>
                  </ListItem>
                );
              });
            })()}
          </ScrollableMsgs>
        </List>
        <Divider />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const files = await uploadFiles();
            if (message !== "" || files.length > 0) {
              const el = document.querySelector("#send-logo") as HTMLElement;
              el.classList.add(classes.fly);
              setTimeout(() => el.classList.remove(classes.fly), 2000);

              chatSocket.send(
                JSON.stringify({
                  type: MessageType.CHAT_MESSAGE,
                  message,
                  files: JSON.stringify(files),
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <GifPicker
                          sendGif={(gif) => {
                            chatSocket.send(
                              JSON.stringify({
                                type: MessageType.CHAT_MESSAGE,
                                message: "",
                                files: `https://i.giphy.com/media/${gif.id}/200w.gif`,
                                partitionKey: currentGroup.id.toString(),
                                userId: activeUser.id,
                                seen: activeUser.id.toString(),
                                createdAt: new Date(),
                              })
                            );
                          }}
                        />
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
      <Grid item xs className={classes.borderLeft500}>
        <Button
          onClick={async () => {
            await removeToken(); // Removing FCM token from database. Ensure this finishes before popping user and token
            popUser();
            popToken();
            router.push(LOGIN_PATH);
          }}
          style={{ marginTop: "20px", marginLeft: "20px" }}
          color="primary"
          variant="outlined"
        >
          Logout
        </Button>
        <List className={classes.userList}>
          {currentGroup &&
            currentGroup.user_set.map((user, index) => (
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
                <ListItemText
                  primary={`${user.first_name} ${user.last_name}${user.id === activeUser.id ? " (you)" : ""}`}
                />
              </ListItem>
            ))}
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
  userList: { overflowY: "auto", display: "flex", flexDirection: "column", flexGrow: 1 },
  messageArea: { height: "90vh" },
  alignSelfRight: { textAlign: "right" },
  name: { marginLeft: "48px" },
  searchBox: { padding: 10 },
  chatBox: { padding: 10, height: "9.5vh" },
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
