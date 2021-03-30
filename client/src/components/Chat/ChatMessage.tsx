import React, { FC } from "react";
import PropTypes from "prop-types";
import cx from "clsx";
import Grid from "@material-ui/core/Grid";
import Avatar from "@material-ui/core/Avatar";
import Typography from "@material-ui/core/Typography";

import withStyles from "@material-ui/core/styles/withStyles";
import defaultChatMsgStyles from "@mui-treasury/styles/chatMsg/default";
import { ChatMsg as ChatMsgType, Group, User } from "types";
import { createMuiTheme, makeStyles } from "@material-ui/core";
import { theme } from "theme";
import { red } from "@material-ui/core/colors";

interface ChatProps {
  msgs: ChatMsgType[];
  user: User;
  side: "left" | "right";
}

export const ChatMessage: FC<ChatProps> = ({ msgs, user, side }) => {
  const classes = chatStyle(createMuiTheme({
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
    }
  }));
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
    <Grid container spacing={2} justify={side === "right" ? "flex-end" : "flex-start"}>
      {side === "left" && (
        <Grid item>
          <Avatar src={user?.profile_picture || ""} className={classes.avatar} />
        </Grid>
      )}
      <Grid item xs={8}>
        {msgs.filter(msg => msg.message).map((msg, i) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div key={i} className={classes[`${side}Row`]}>
              <Typography align={"left"} className={cx(classes.msg, classes[side], attachClass(i))}>
                {msg.message}
              </Typography>
            </div>
          );
        })}
      </Grid>
    </Grid>
  );
};

const chatStyle = makeStyles(({ palette, spacing }) => {
  const radius = spacing(2.5);
  const size = spacing(4);
  const rightBgColor = palette.primary.main;
  // if you want the same as facebook messenger, use this color '#09f'
  return {
    avatar: {
      width: size,
      height: size,
    },
    leftRow: {
      textAlign: 'left',
    },
    rightRow: {
      textAlign: 'right',
    },
    msg: {
      padding: spacing(1, 2),
      borderRadius: 4,
      marginBottom: 4,
      display: 'inline-block',
      wordBreak: 'break-word',
      fontFamily:
        // eslint-disable-next-line max-len
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
      fontSize: '14px',
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
