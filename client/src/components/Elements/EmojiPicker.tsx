import { ClickAwayListener, makeStyles } from "@material-ui/core";
import { Picker } from "emoji-mart";
import "emoji-mart/css/emoji-mart.css";
import React, { FC, useState } from "react";

interface EmojiPickerProps {
  setMessage: (message: string) => void;
}

export const EmojiPicker: FC<EmojiPickerProps> = ({ setMessage }) => {
  const classes = useStyles();
  const [emojiOpen, setEmojiOpen] = useState(false);

  return (
    <ClickAwayListener onClickAway={() => setEmojiOpen(false)}>
      <div className={classes.root}>
        <button style={{ cursor: "pointer" }} type="button" onClick={() => setEmojiOpen(!emojiOpen)}>
          🤨
        </button>
        {emojiOpen && (
          <div className={classes.dropdown}>
            <Picker
              set="apple"
              onSelect={(emoji) => setMessage(emoji.native)}
              title="Pick your emoji…"
              emoji="point_up"
              style={{ position: "absolute", bottom: "20px", right: "20px" }}
            />
          </div>
        )}
      </div>
    </ClickAwayListener>
  );
};

const useStyles = makeStyles(() => ({
  root: {
    position: "relative",
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
}));
