import { Box, Grid, List, ListItem, ListItemText, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import { format } from "date-fns";
import React, { DragEvent, FC, useEffect, useRef, useState } from "react";
import Measure from "react-measure";
import { ChatMsg as ChatMsgType, Group, MessageType, Status, User } from "types";
import { ChatMessage } from "./ChatMessage";
import { ScrollableMsgs } from "./ScrollableMsgs";

interface ChatProps {
  activeUser: User | null;
  chatMsgs: ChatMsgType[];
  currentUsers: string[];
  currentGroup: Group;
  chunkedMsgs: [User, ChatMsgType[]][];
  onMsgUpdate: (
    updateType: "edited" | "deleted",
    msgData: { rowKey: string; partitionKey: string },
    modification: string
  ) => void;
}

const memoAreEqual = (prev: ChatProps, next: ChatProps) => {
  return prev.chunkedMsgs == next.chunkedMsgs;
};

export const ChatMessages: FC<ChatProps> = React.memo(
  ({ activeUser, chatMsgs, currentUsers, currentGroup, chunkedMsgs, onMsgUpdate }) => {
    const classes = useStyles();
    const scrollableRef = useRef<Measure>();
    console.log(chatMsgs);
    const lastSeenSet = chatMsgs[chatMsgs.length - 1]?.seen.split(" ") || [];
    const lastSeen = currentUsers.every((i) => lastSeenSet.includes(i));
    let earliestSeenMsg: number | null = null;
    let lastSeenUsers = "Seen by ";

    if (currentGroup) {
      const lastSeenSetUsers = currentGroup.user_set.filter((x) => lastSeenSet.includes(String(x.id)));
      lastSeenUsers += Array.from(
        new Set(lastSeenSetUsers.filter((x) => x.id != activeUser.id).map((x) => x.first_name))
      )
        .slice(0, 3)
        .join(", ");
      if (lastSeenSetUsers.length == 1) {
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

    return (
      <div style={{ paddingTop: 0 }} className={classes.messageArea}>
        <ScrollableMsgs ref={scrollableRef} key="scrollableRefs">
          <List>
            {chunkedMsgs.map(([user, chatMsgs], index) => {
              const isActiveUser = user?.id === activeUser.id;
              let seen: string = "";
              if (index == chunkedMsgs.length - 1) seen = (lastSeen ? "✓✓ " : "✓ ") + `${lastSeenUsers} `;
              else if (index == earliestSeenMsg) seen = "✓✓ " + `Seen by everyone `;

              return (
                <ListItem key={index}>
                  <Grid container>
                    <Grid item xs={12}>
                      <ChatMessage
                        key={index + '-msgs'}
                        msgs={chatMsgs}
                        user={user}
                        side={isActiveUser ? "right" : "left"}
                        // :( it does exist they just have bad type script files
                        onMediaLoad={() => (scrollableRef.current as any).measure()}
                        onMessageChanged={onMsgUpdate}
                      />
                      <List className={clsx({ [classes.alignSelfRight]: isActiveUser })}>
                        <Box display="flex" key={index + "-box"}>
                          <ListItem style={{ padding: 0 }} className={clsx({ [classes.alignSelfRight]: isActiveUser })}>
                            <ListItemText
                              className={clsx({ [classes.alignSelfRight]: isActiveUser }, classes.name)}
                              secondary={seen + format(chatMsgs[chatMsgs.length - 1].createdAt, "h:mm aa")}
                            />
                          </ListItem>
                        </Box>
                      </List>
                    </Grid>
                  </Grid>
                </ListItem>
              );
            })}
          </List>
        </ScrollableMsgs>
      </div>
    );
  },
  memoAreEqual
);

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
