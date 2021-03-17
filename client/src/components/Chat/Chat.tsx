import {
  Avatar,
  Button,

  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,

  DialogContentText, DialogTitle,



  Divider,







  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles, Menu,
  MenuItem,
  Paper,
  TextField
} from "@material-ui/core";
import { ExitToAppSharp, SearchRounded } from "@material-ui/icons";
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { ChatMsg } from "@mui-treasury/components/chatMsg";
import axios from "axios";
import clsx from "clsx";
import { format } from "date-fns";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import { useRouter } from "next/router";
import React, { createRef, DragEvent, FC, useEffect, useRef, useState } from "react";
import SendLogo from 'react-svg-loader!styles/send.svg';
import { Group, User } from "types";
import { popToken } from "util/auth/token";
import { popUser } from "util/auth/user";
import { SEARCH_GROUPS_PATH } from "util/constants";
import MediaRender from "./MediaRender";

//let delete_endpoint = '${process.env.NEXT_PUBLIC_WS_URL} + /delete/';
//let edit_endpoint = "http://127.0.0.1:8000/delete/";

const options = [
  'Delete',
  'Edit'
];

const ITEM_HEIGHT = 20;

interface ChatProps {
  activeUser: User;
}

interface IChatMsg {
  message: string;
  files: string;
  userId: number;
  timestamp: Date;
  rowKey: string;
  partitionKey: string;
  seen: string;
}

export const Chat: FC<ChatProps> = ({ activeUser }) => {
  const classes = useStyles();
  const router = useRouter();

  const [userGroups, setUserGroups] = useState<Group[]>(activeUser.groups);

  const [chatMsges, setChatMsges] = useState<IChatMsg[]>([]);
  const [message, setMessage] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(
    activeUser.groups.length > 0 ? activeUser.groups[0] : null
  );
  const messageIcon = createRef();
  const chatMsgesRef = useRef(chatMsges);
  const [deactive, setDeactive] = useState(false);
  const [retry, setRetry] = useState(false);
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const lastMessageRef = useRef(null);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const [emojiOpen, setEmojiOpen] = useState(false);

  const validateFile = (file: File) => {
    // If we want to do some valid type processing here
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (validTypes.indexOf(file.type) === -1) {
      return false;
    }
    return true;
  };

  const handleFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      if (validateFile(files[i])) {
        // a valid file
        setSelectedFiles((prevArray: [File]) => [...prevArray, files[i]]); // adding the file to prevArray which is our array of selected files (held in state)
      } else {
        // not a valid file
        files[i]["invalid"] = true;
        setSelectedFiles((prevArray: [File]) => [...prevArray, files[i]]); // adding the file to prevArray which is our array of selected files (held in state)
        setErrorMessage("File type not permitted");
      }
    }
  };

  const fileDrop = (e: DragEvent<HTMLInputElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length) {
      handleFiles(files);
    }
  };

  const removeFile = (name: String) => {
    const fileIndex = selectedFiles.findIndex((e: File) => e.name === name);
    selectedFiles.splice(fileIndex, 1);
    setSelectedFiles([...selectedFiles]);
  };

  const uploadFiles = async () => {
    const urls: String[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const formData = new FormData();
      formData.append("file", selectedFiles[i]);
      formData.append("name", currentGroup.name);
      const response = await axios.post("/api/upload/", formData);
      urls.push(response.data["url"]);
    }
    // Only handle single files for now
    if (urls.length === 1) {
      return urls[0];
    }
    return "";
  };

  const onEmojiSelect = (emoji) => {
    setMessage(message + emoji.native)
  }

  // Connects to the websocket and refreshes content on first render only
  useEffect(() => {
    if (!currentGroup) return;

    if (chatSocket) {
      chatSocket.onclose = () => { };
      chatSocket.close();
    }

    setRetry(false);
    const newChatSocket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_URL}/ws/messaging/${currentGroup.id}/${activeUser.id}/`);

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

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // Handle 'chat options' click
  const handleOptionClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle 'chat options' close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Function to delete a selected message
  const deleteMsg = async (rowKey, partitionKey) => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/delete/`;
    await axios.post(endpoint, {
      rowKey: rowKey,
      partitionKey: partitionKey
    })
      .then((response) => {
        console.log(response.data.status);
        if (response.data.status === "Deleted") {
          const i = chatMsgesRef.current.findIndex((obj => obj.rowKey == rk));
          chatMsgesRef.current[i].message = "[MESSAGE DELETED]";
          chatMsgesRef.current[i].files = "";
          setChatMsges([...chatMsgesRef.current]);
        }
      })
  }

  // Binding for opening the edit message screen
  const [editMsgBit, setEditMsg] = React.useState(false);
  const [rk, setrk] = React.useState("");
  const [pk, setpk] = React.useState("");
  const [changedMessage, setChangedMessage] = React.useState("");
  const [currentMessage, setCurrentMessage] = React.useState("");

  // Close the message box UI
  const handleEditMsgClose = () => {
    setEditMsg(false);
    setChangedMessage("");
    setCurrentMessage("");
    setrk("")
    setpk("")
  };

  // Execute the edit message request
  const editMsg = async () => {
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/edit/`;
    await axios.post(endpoint, {
      rowKey: rk,
      partitionKey: pk,
      message: changedMessage
    })
      .then((response) => {
        console.log(response.data.status);
        if (response.data.status === "Edited") {
          const i = chatMsgesRef.current.findIndex((obj => obj.rowKey == rk));
          chatMsgesRef.current[i].message = changedMessage;
          setChatMsges([...chatMsgesRef.current]);
        }
      })

    handleEditMsgClose();
  }

  const selectOption = async (o) => {
    console.log(rk)
    if (o === 'Delete') {
      deleteMsg(rk, pk);
      handleEditMsgClose();
    } else if (o === 'Edit') {
      setEditMsg(true);
    }
    handleClose();
  };

  const username = activeUser.first_name + " " + activeUser.last_name;

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xs={3} className={classes.borderRight500}>
        <Grid container alignItems="center">
          <Grid item xs={3}>
            <List>
              <ListItem button onClick={() => router.push("/user/details/" + activeUser.id)}>
                <ListItemIcon>
                  <Avatar alt={username} src={activeUser.profile_picture} />
                </ListItemIcon>
                <ListItemText primary={username} />
              </ListItem>
            </List>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={1}>
              <Grid item xs={6} className={classes.actionButtonArea}>
                <Button
                  onClick={() => {
                    popUser();
                    popToken();
                    router.push("/auth/login");
                  }}
                  color="primary"
                  variant="contained"
                >
                  Logout
                </Button>
              </Grid>
              <Grid item xs={5} className={classes.actionButtonArea}>
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
              </Grid>
            </Grid>
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
                    await axios.delete("/api/groups/" + group.id + "/remove_user");
                    userGroups.splice(index, 1)
                    setUserGroups(userGroups);
                    setCurrentGroup(userGroups.length > 0 ? userGroups[0] : null);
                  }}>
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
          {chatMsges.map((chatMsg, index) => (
            <ListItem key={index}>
              <Grid container>
                <Grid item xs={12}>
                  {chatMsg.message !== "" ? <ChatMsg side={chatMsg.userId === activeUser.id ? "right" : "left"} messages={[chatMsg.message]} /> : null}
                  <MediaRender
                    url={chatMsg.files}
                    isRight={chatMsg.userId === activeUser.id ? true : false}
                  />
                  <Grid container>
                    <Grid item xs={12} >
                      <List className={clsx({ [classes.alignSelfRight]: chatMsg.userId === activeUser.id })}>
                        <ListItem className={clsx({ [classes.alignSelfRight]: chatMsg.userId === activeUser.id })}>
                          <ListItemText
                            className={clsx({ [classes.alignSelfRight]: chatMsg.userId === activeUser.id })}
                            style={{ width: '100px' }}

                            secondary={(chatMsg.seen.split(" ").length === currentGroup.user_set.length ? "✓ " : "✓✓ ") + format(chatMsg.timestamp, "h:mm aa")}
                          />
                          <ListItem button
                            className={clsx({ [classes.hide]: chatMsg.userId !== activeUser.id })}
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            style={{ width: '20px', height: '20px' }}
                            onClick={(e) => {
                              handleOptionClick(e);
                              setpk(chatMsg.partitionKey);
                              setrk(chatMsg.rowKey);
                              setCurrentMessage(chatMsg.message);
                            }}
                          >
                            <MoreVertIcon />
                          </ListItem>
                          <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                              style: {
                                maxHeight: ITEM_HEIGHT * 4.5,
                                width: '20ch',
                              },
                            }}
                          >
                            {options.map((option) => (
                              <MenuItem key={option} onClick={() => {
                                selectOption(option)
                              }}>
                                {option}
                              </MenuItem>
                            ))}
                          </Menu>
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>

                </Grid>
              </Grid>
            </ListItem>
          ))}
          <ListItem ref={lastMessageRef}></ListItem>
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
                  onDragOver={(e: React.DragEvent<HTMLInputElement>) => {
                    e.preventDefault();
                  }}
                  onDragEnter={(e: React.DragEvent<HTMLInputElement>) => {
                    e.preventDefault();
                  }}
                  onDragLeave={(e: React.DragEvent<HTMLInputElement>) => {
                    e.preventDefault();
                  }}
                  onDrop={fileDrop}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <ClickAwayListener
                          onClickAway={() => {
                            setEmojiOpen(false);
                          }}
                        >
                          <div className={classes.root}>
                            <button
                              style={{
                                "cursor": "pointer"
                              }}
                              type="button"
                              onClick={() => {
                                setEmojiOpen(!emojiOpen);
                              }}
                            >
                              🤨
                            </button>
                            {emojiOpen && (
                              <div className={classes.dropdown}>
                                <Picker set='apple' onSelect={onEmojiSelect} title='Pick your emoji…' emoji='point_up' style={{ position: 'absolute', bottom: '20px', right: '20px' }} i18n={{ search: 'Search', categories: { search: 'Results of search', recent: 'Recent' } }} />
                              </div>
                            )}
                          </div>
                        </ClickAwayListener>
                        <IconButton disabled={deactive} type="submit" color="inherit">
                          <SendLogo id="send-logo" width={25} height={25} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid className="file-display-container">
                {selectedFiles.map((data: File & { invalid: String }, i: Number) => (
                  <span className="file-status-bar">
                    <span className={`file-name ${data.invalid ? "file-error" : ""}`}>{data.name}</span>
                    <span className="file-remove" onClick={() => removeFile(data.name)}>
                      X
                    </span>
                  </span>
                ))}
              </Grid>
            </Grid>
          )}
        </form>
      </Grid>
      <Grid item xs={1} className={classes.borderLeft500}>
        <List className={classes.userList}>
          {currentGroup.user_set.map((user) => (
            <ListItem>
              <ListItemIcon>
                <Avatar alt={user.first_name} src={user.profile_picture} />
              </ListItemIcon>
              <ListItemText primary={user.first_name + " " + user.last_name} />
            </ListItem>
          ))}
        </List>
      </Grid>
      <Dialog
        open={editMsgBit}
        onClose={handleEditMsgClose}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="sm">
        <DialogTitle id="form-dialog-title">Edit Message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Edit your message below:
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="standard-multiline-flexible"
            label="New Message"
            multiline
            rowsMax={10}
            fullWidth
            defaultValue={currentMessage}
            onChange={(e) => setChangedMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditMsgClose} color="primary">
            Cancel
          </Button>
          <Button onClick={editMsg} color="primary">
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Grid >
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
  actionButtonArea: { display: "flex", justifyContent: "flex-end" },
  root: {
    position: "relative",
    width: 300,
    justifyContent: "flex-end",
    textAlign: "right",
  },
  dropdown: {
    position: "absolute",
    bottom: 28,
    right: 0,
    left: 0,
    zIndex: 1,
    justifyContent: "flex-start",
    textAlign: "left",
  },
  fly: {
    "position": "absolute",
    "animation": "$message-fly 2s ease-in",
    "animation-delay": "0s",
    "z-index": 10,
  },
  "@keyframes message-fly": {
    "0%": {},
    "25%": { "transform": "rotate(-90deg)" },
    "100%": { transform: "rotate(-120deg) translate(1000px)", display: "none" },
  }
}));

export default Chat;
