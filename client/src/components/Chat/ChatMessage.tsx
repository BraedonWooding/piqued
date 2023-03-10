import { createMuiTheme, makeStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import { red } from "@material-ui/core/colors";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import cx from "clsx";
import { FC } from "react";
import { ChatMsg as ChatMsgType, Feed, User } from "types";
import { EditDeleteChatMsgButton } from "./EditDeleteChatMsgButton";
import { MediaRender } from "./MediaRender";

interface ChatProps {
  msgs: ChatMsgType[];
  user: User | Feed;
  side: "left" | "right";
  onMediaLoad: () => void;
  onMessageChanged: (type: "edited" | "deleted", msg: ChatMsgType, modification?: string) => void;
}

export const ChatMessage: FC<ChatProps> = ({ msgs, user, side, onMediaLoad, onMessageChanged }) => {
  const classes = chatStyle(
    createMuiTheme({
      spacing: () => 2,
      palette: {
        background: {
          default: "#F0F2F5",
        },
        primary: {
          main: "#3578E5",
        },
        secondary: {
          main: "#19857b",
        },
        error: {
          main: red.A400,
        },
      },
    })
  );
  const attachClass = (index: number) => {
    if (index === 0) {
      return classes[`${side}First`];
    }
    if (index === msgs.length - 1) {
      return classes[`${side}Last`];
    }
    return "";
  };

  return (
    <Grid style={{paddingTop: 30}} container spacing={1} justify={side === "right" ? "flex-end" : "flex-start"}>
      {side === "left" && (
        <Typography className={classes.name}>
          {((user as User)?.first_name || (user as Feed)?.name)} {((user as User)?.last_name || "")}
        </Typography>
      )}
      <Grid container spacing={2} justify={side === "right" ? "flex-end" : "flex-start"} alignItems="center" >
        {side === "left" && (
          <Grid item>
            <Avatar src={((user as User)?.profile_picture || (user as Feed)?.image_url || "")} className={classes.avatar} />
          </Grid>
        )}
        <Grid item xs={8}>
          {msgs.map((msg, i) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div key={msg.rowKey} className={classes[`${side}Row`]}>
                {msg.message && (
                  <div>
                    <Typography align={"left"} className={cx(classes.msg, classes[side], attachClass(i))}>
                      {msg.message}
                    </Typography>
                    {side === "right" && (
                      <EditDeleteChatMsgButton
                        initialMessage={msg.message}
                        onDelete={() => onMessageChanged("deleted", msg)}
                        onEdit={(modification) =>
                          modification.trim() != ""
                            ? onMessageChanged("edited", msg, modification)
                            : onMessageChanged("deleted", msg)
                        }
                      />
                    )}
                  </div>
                )}
                <Grid container justify={side === "right" ? "flex-end" : "flex-start"} alignItems={side === "right" ? "flex-end" : "flex-start"}>
                  <Grid container style={{marginRight: 15}} direction="column" spacing={2} justify={side === "right" ? "flex-end" : "flex-start"} alignItems={side === "right" ? "flex-end" : "flex-start"}>
                    {msg.files.map((file, i) => (
                      <MediaRender key={msg.rowKey + "-file-" + i} url={file.url} type={file.type} onLoad={onMediaLoad} />
                    ))}
                  </Grid>
                  {side === "right" && msg.files && !msg.message && (
                    <EditDeleteChatMsgButton
                      initialMessage={msg.message}
                      onDelete={() => onMessageChanged("deleted", msg)}
                      onEdit={(modification) =>
                        modification.trim() != ""
                          ? onMessageChanged("edited", msg, modification)
                          : onMessageChanged("deleted", msg)
                      }
                    />
                  )}
                </Grid>
              </div>
            );
          })}
        </Grid>
      </Grid>
    </Grid>
  );
};

const chatStyle = makeStyles(({ palette, spacing }) => {
  const radius = spacing(2.5);
  const size = spacing(4);
  const rightBgColor = palette.primary.main;

  return {
    avatar: {
      width: size,
      height: size,
    },
    name: {
      marginLeft: size,
      marginBottom: 2,
      fontSize: 12,
      color: "#7A7B7F",
    },
    leftRow: {
      textAlign: "left",
    },
    rightRow: {
      textAlign: "right",
    },
    msg: {
      padding: spacing(1, 2),
      borderRadius: 4,
      marginBottom: 4,
      display: "inline-block",
      wordBreak: "break-word",
      fontFamily:
        // eslint-disable-next-line max-len
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      fontSize: "14px",
    },
    left: {
      borderTopRightRadius: radius,
      borderBottomRightRadius: radius,
      backgroundColor: palette.grey[100],
    },
    right: {
      borderTopLeftRadius: radius,
      borderBottomLeftRadius: radius,
      backgroundColor: rightBgColor,
      color: palette.common.white,
    },
    leftFirst: {
      borderTopLeftRadius: radius,
    },
    leftLast: {
      borderBottomLeftRadius: radius,
    },
    rightFirst: {
      borderTopRightRadius: radius,
    },
    rightLast: {
      borderBottomRightRadius: radius,
    },
  };
});
