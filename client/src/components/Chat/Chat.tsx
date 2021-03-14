import {
  Avatar,
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
import { Send } from "@material-ui/icons";
import { ChatMsg } from "@mui-treasury/components/chatMsg";
import clsx from "clsx";
import { format } from "date-fns";
import { useRouter } from "next/router";
import React, { FC, useEffect, useRef, useState } from "react";
import { User, Group } from "types";
import { popToken } from "util/auth/token";
import { popUser } from "util/auth/user";
import axios from "axios";
import MediaRender from "./MediaRender"

interface ChatProps {
  activeUser: User;
}

interface IChatMsg {
  message: string;
  files: string;
  userId: number;
  timestamp: Date;
}

// Just a localhost endpoint
let upload_endpoint = "http://127.0.0.1:8000/upload/"

export const Chat: FC<ChatProps> = ({ activeUser }) => {
  const classes = useStyles();
  const router = useRouter();

  const [chatMsges, setChatMsges] = useState<IChatMsg[]>([]);
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

  // File handling
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const dragOver = (e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault();
  }

  const dragEnter = (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
  }

  const dragLeave = (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
  }

  const fileDrop = (e: React.DragEvent<HTMLInputElement>) => {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files.length) {
          console.log(files)
          console.log(selectedFiles)
          handleFiles(files);
      }
  }

  const handleFiles = (files: FileList) => {
      for (let i = 0; i < files.length; i++) {
          if (validateFile(files[i])) {
              // a valid file
              setSelectedFiles((prevArray: [File]) => [...prevArray, files[i]]); // adding the file to prevArray which is our array of selected files (held in state)
          } else {
              // not a valid file
              files[i]['invalid'] = true;
              setSelectedFiles((prevArray: [File]) => [...prevArray, files[i]]); // adding the file to prevArray which is our array of selected files (held in state)
              setErrorMessage('File type not permitted');
          }
      }
  }

  const validateFile = (file: File) => {
      // If we want to do some valid type processing here
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (validTypes.indexOf(file.type) === -1) {
          return false;
      }
      return true;
  }

  const removeFile = (name: String) => {
      const fileIndex = selectedFiles.findIndex((e: File) => e.name === name);
      selectedFiles.splice(fileIndex, 1);
      setSelectedFiles([...selectedFiles])
  }

  const clearFiles = () => {
    console.log(selectedFiles)
    setSelectedFiles([]);
  }

  const uploadFiles = async () => {
    var urls:String[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData();
          formData.append('file', selectedFiles[i]);
          await axios.post(upload_endpoint, formData)
            .then((response) => {
              console.log(response.data)
              urls.push(response.data["url"]);
            })
      }
      // Only handle single files for now
      if (urls.length === 1) {
        return urls[0];
      }
      return "";
  }

  // Connects to the websocket and refreshes content on first render only
  useEffect(() => {
    if (!currentGroup) return;

    if (chatSocket) {
      chatSocket.onclose = () => {};
      chatSocket.close();
    }
    
    setRetry(false);
    const newChatSocket = new WebSocket(`ws://${process.env.NEXT_PUBLIC_WS_URL}/ws/messaging/${currentGroup.id}/`);

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
      const { message, files, userId, timestamp } = JSON.parse(e.data);
      chatMsgesRef.current.push({ message, files, userId, timestamp: new Date(timestamp) });
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

  const username = activeUser.first_name + " " + activeUser.last_name;

  return (
    <Grid container component={Paper} className={classes.chatSection}>
      <Grid item xs={3} className={classes.borderRight500}>
        <Grid container alignItems="center">
          <Grid item xs={6}>
            <List>
              <ListItem button onClick={() => router.push("/user/details/" + activeUser.id)}>
                <ListItemIcon>
                  <Avatar alt={username} src={activeUser.profile_picture} />
                </ListItemIcon>
                <ListItemText primary={username} />
              </ListItem>
            </List>
          </Grid>
          <Grid container xs={6} justify="center" >
            <Button onClick={() => { popUser(); popToken(); router.push("/auth/login") }} color="primary" variant="contained">
              Logout
            </Button>
          </Grid>
        </Grid>
        <Divider />
        <List className={classes.userList}>
          {activeUser.groups.map((group) => (
            <ListItem
              disabled={deactive}
              className={clsx({ [classes.currentGroup]: group === currentGroup })}
              button
              key={group.id}
              onClick={() => {
                setCurrentGroup(group);
              }}
            >
              <ListItemText primary={group.name} />
            </ListItem>
          ))}
        </List>
      </Grid>
      <Grid item xs={9}>
        <List className={classes.messageArea}>
          {chatMsges.map((chatMsg, index) => (
            <ListItem key={index}>
              <Grid container>
                <Grid item xs={12}>
                  {chatMsg.message !== "" ? <ChatMsg side={chatMsg.userId === activeUser.id ? "right" : "left"} messages={[chatMsg.message]}/> : null}
                  <MediaRender 
                    url={chatMsg.files}
                    isRight={chatMsg.userId === activeUser.id ? true : false}
                  />
                  <ListItemText
                    className={clsx({ [classes.alignSelfRight]: chatMsg.userId === activeUser.id })}
                    secondary={format(chatMsg.timestamp, "h:mm aa")}
                  />
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
            let files = await uploadFiles();
            if (message !== "" || files !== "") {
              chatSocket.send(
                JSON.stringify({
                  userId: activeUser.id,
                  files: files,
                  message,
                  timestamp: new Date(),
                })
              );
              console.log(files)
              setMessage("");
              clearFiles();
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
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton disabled={deactive} type="submit" color="inherit">
                        <Send />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid className="file-display-container"> {
                selectedFiles.map((data: File & {invalid: String}, i: Number) =>
                    <span className="file-status-bar">
                        <span className={`file-name ${data.invalid ? 'file-error' : ''}`}>{data.name}</span>
                        <span className="file-remove" onClick={() => removeFile(data.name)}>X</span>
                    </span>
                )
            }
            </Grid>
          </Grid>
        )}
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
  currentGroup: {
    border: "2px solid black",
  },
}));

export default Chat;
