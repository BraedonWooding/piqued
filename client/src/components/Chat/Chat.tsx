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
  Typography,
} from "@material-ui/core";
import { Delete, ExitToAppSharp, SearchRounded } from "@material-ui/icons";
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
import { lookupUser, popUser } from "util/auth/user";
import { DISCOVER_ROOT_PATH, LOGIN_PATH, RSS_FEEDS } from "util/constants";
import { removeToken } from "../../firebase";
import { ChatMessage } from "./ChatMessage";
import { ChatMessages } from "./ChatMessages";
import { FileStatusBar } from "./FileStatusBar";
import { MuteButton } from "./MuteButton";
import { ScrollableMsgs } from "./ScrollableMsgs";
import { GiphyFetch } from "f-giphy-pfft-js-fetch-api";

interface ChatProps {
  activeUser: User | null;
}

const API_KEY = "c6Hr9L8EZfXoZtKCliUeRiEtefKxL04j";

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
  const [deactive, setDeactive] = useState(false);
  const [retry, setRetry] = useState(false);
  const [groupHover, setGroupHover] = useState(null); // Stores index of hovered group
  const giphy = new GiphyFetch(API_KEY);

  /*
  Parses a message to see if it is a text shortcut.
  If it is, handles accordingly and returns true.
  Otherwise returns false to let other code handle sending the message as normal
  */
  const handleIfShortcut = async (message: string, files) => {
    message = message.trim();
    // Image/gif text shortcuts only valid if they are the only thing in the message
    // An image/gif interspersed with a sentence doesn't really make sense
    var file: { url: string; type: string };
    var isShortcut: boolean = false;
    if (message == "/piqued") {
      isShortcut = true;
      file = {
        url: "/favicon.ico",
        type: "image/png",
      };
    } else if (message.startsWith("/gif-")) {
      isShortcut = true;
      message = message.slice(5);
      if (message == "") {
        // If message is just "/gif-", return false
        return false;
      }
      const gifArray = await giphy.search(message, { limit: 1 });
      if (gifArray.data.length <= 0) {
        return false;
      }
      const gif = gifArray.data[0];
      file = {
        url: `https://i.giphy.com/media/${gif.id}/200w.gif`,
        type: "image/gif",
      };
    } else if (
      message == "/adam" ||
      message == "/braedon" ||
      message == "/jimmy" ||
      message == "/matthew" ||
      message == "/nicholas"
    ) {
      isShortcut = true;
      file = {
        url: message.concat(".jpg"),
        type: "image/jpg",
      };
    }
    if (isShortcut) {
      files.push(file);
      chatSocket.send(
        JSON.stringify({
          type: MessageType.CHAT_MESSAGE,
          message: "",
          files: JSON.stringify(files),
          partitionKey: currentGroup.id.toString(),
          userId: activeUser.id,
          seen: activeUser.id.toString(),
          createdAt: new Date(),
        })
      );
    }
    return isShortcut ? true : false;
  };

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
    else if (!chatSocket || retry) {
      setRetry(false);
      if (timer) clearInterval(timer);
      const newChatSocket = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL}/ws/messaging/${activeUser.id}/`);

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

      newChatSocket.onmessage = async (e) => {
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
        } else if (parsedData.type === MessageType.USER_UPDATE) {
          let { userId, groupId, user, status } = parsedData;
          if (!user && userId) {
            user = await lookupUser(userId);
          }
          if (user) {
            userGroupsRef.current.forEach((group) => {
              if (group && group.id == groupId) {
                if (status == "added" && group.user_set.every((x) => x.id != userId)) {
                  group.user_set.push(user);
                } else if (status == "deleted") {
                  group.user_set = group.user_set.filter((x) => x.id != userId);
                }
              }
            });
            setUserGroups([...userGroupsRef.current]);
          }
        } else if (parsedData.type === MessageType.MESSAGE_UPDATE) {
          const { partitionKey, rowKey, modification, updateType } = parsedData;
          if (updateType === "edited") {
            const msg = chatMsgsRef.current.find((x) => x.rowKey == rowKey);
            msg.message = modification;
            setChatMsgs([...chatMsgsRef.current]);
          } else if (updateType === "deleted") {
            const index = chatMsgsRef.current.findIndex((x) => x.rowKey == rowKey);
            if (index >= 0 && index < chatMsgsRef.current.length) {
              chatMsgsRef.current.splice(index, 1);
              setChatMsgs([...chatMsgsRef.current]);
            }
          } else {
            console.error("invalid update type: " + updateType);
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
  }, [chatSocket?.readyState, chatMsgs]);

  useEffect(() => {
    // chunk msgs together if sent within a minute from the same person
    // write the profile picture in there as well
    if (currentGroup) {
      const user_map = {};
      currentGroup.user_set.map((u) => (user_map[u.id] = u));
      const feed_map = {};
      currentGroup.feeds.map((f) => (user_map["feed/" + f.id] = f));
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
          all_msgs.push([user_map[newest_msg.userId] || feed_map[newest_msg.userId] || null, [...current_msg_set]]);
          current_msg_set = [m];
          newest_msg = m;
        }
      });
      if (current_msg_set.length > 0) all_msgs.push([user_map[newest_msg.userId] || feed_map[newest_msg.userId] || null, [...current_msg_set]]);

      setChunkedMsgs(all_msgs);
    }
  }, [currentGroupRef.current, chatMsgs]);

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xl={2} md={3} lg={3} xs={3} sm={3} className={classes.borderRight500}>
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <List>
              <ListItem button key={"user"} onClick={() => router.push("/user/details/")}>
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
                router.push(DISCOVER_ROOT_PATH);
              }}
              color="primary"
              variant="text"
            >
              <SearchRounded />
              Discover
            </Button>
          </Grid>
        </Grid>
        <Divider />
        <List className={classes.userList}>
          {userGroups.map(
            (group, index) =>
              (!group.expired_at || new Date() < new Date(group.expired_at)) && (
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
          {(!userGroups || userGroups.length == 0) && (
            <Typography style={{ marginLeft: 15 }}>
              You aren't in any groups! You can search for some through the "Search" button
            </Typography>
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
        <ChatMessages
          chatMsgs={chatMsgs}
          currentGroup={currentGroup}
          currentUsers={currentUsers}
          activeUser={activeUser}
          chunkedMsgs={chunkedMsgs}
          onMsgUpdate={(updateType, { rowKey, partitionKey }, modification) => {
            chatSocket.send(
              JSON.stringify({
                type: MessageType.MESSAGE_UPDATE,
                updateType,
                rowKey,
                partitionKey,
                modification,
              })
            );
          }}
        ></ChatMessages>
        <Divider />
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const files = await uploadFiles();
            if (message !== "" || files.length > 0) {
              const el = document.querySelector("#send-logo") as HTMLElement;
              el.classList.add(classes.fly);
              setTimeout(() => el.classList.remove(classes.fly), 2000);
              const isShortcut: boolean = await handleIfShortcut(message, files);
              if (!isShortcut) {
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
              }
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
        {currentGroup && (
          <Button
            onClick={async () => {
              router.push(RSS_FEEDS + "/?id=" + currentGroup.id);
            }}
            style={{ marginTop: "20px", marginLeft: "20px" }}
            color="primary"
            variant="outlined"
          >
            Manage Feeds
          </Button>
        )}
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
          <Divider />
          {currentGroup &&
            currentGroup.feeds.map((feed, index) => (
              <ListItem key={feed.id}>
                <ListItemIcon>
                  <Badge
                    overlap="circle"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    color={"primary"}
                    variant="dot"
                  >
                    <Avatar alt={feed.name} src={feed.image_url} />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary={`${feed.name} (RSS)`} />
                <Button
                  className={classes.slimButton}
                  onClick={async () => {
                    try {
                      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/groups/${currentGroup.id}/remove_feed/`, {
                        data: {
                          feed_id: feed.feed_id,
                        },
                      });
                      currentGroup.feeds.splice(index, 1);
                      setCurrentGroup({ ...currentGroupRef.current });
                    } catch {}
                  }}
                >
                  <Delete />
                  Remove
                </Button>
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
