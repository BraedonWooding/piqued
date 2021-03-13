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
import axios from "axios";

interface ChatProps {
  activeUserId: number;
  activeUsername: string;
  groupId: number;
  groupName: string
}

interface IChatMsg {
  message: string;
  files: string[];
  userId: number;
  timestamp: Date;
}

// Just a localhost endpoint
let upload_endpoint = "http://127.0.0.1:8000/upload"

export const Chat: FC<ChatProps> = ({ activeUserId, activeUsername, groupId, groupName }) => {
  const classes = useStyles();
  const [chatMsges, setChatMsges] = useState<IChatMsg[]>([]);
  const [message, setMessage] = useState("");
  const [chatSocket, setChatSocket] = useState<WebSocket | null>(null);
  const chatMsgesRef = useRef(chatMsges);

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
          console.log("yeet")
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
    setSelectedFiles([]);
  }

  const uploadFiles = () => {
    let urls:String[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
          const formData = new FormData();
          formData.append('image', selectedFiles[i]);
          console.log("DO UPLOAD")
          axios.post(upload_endpoint, formData)
            .then((response) => {
              urls.push(response["url"]);
            })
      }
      return urls;
  }

  // Connects to the websocket and refreshes content on first render only
  useEffect(() => {
    const newChatSocket = new WebSocket(`ws://127.0.0.1:8000/ws/messaging/${groupId}/`);
    newChatSocket.onmessage = (e) => {
      const { message, userId, timestamp } = JSON.parse(e.data);
      chatMsgesRef.current.push({ message, files: [], userId, timestamp: new Date(timestamp) });
      setChatMsges([...chatMsgesRef.current]);
    };
    newChatSocket.onclose = (e) => console.error("Chat socket closed unexpectedly");
    setChatSocket(newChatSocket);
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
                  {chatMsg.files.map((file) => 
                    <img src={file}>
                    </img>
                  )}
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
        <Divider />
        <form
          onSubmit={(e) => {
            let files = uploadFiles();
            e.preventDefault();
            if (message !== "") {
              chatSocket.send(
                JSON.stringify({
                  userId: activeUserId,
                  files: files,
                  message,
                  timestamp: new Date(),
                })
              );
              setMessage("");
              clearFiles();
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
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}
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
