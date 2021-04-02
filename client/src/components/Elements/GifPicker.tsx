import { GiphyFetch } from "@giphy/js-fetch-api";
import { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";
import { ClickAwayListener, makeStyles, TextField } from "@material-ui/core";
import React, { FC, useState } from "react";
//@ts:ignore
import GifLogo from "react-svg-loader!assets/icons/gif.svg";

const API_KEY = "c6Hr9L8EZfXoZtKCliUeRiEtefKxL04j";

interface GifPickerProps {
  sendGif: (message: IGif) => void;
}

export const GifPicker: FC<GifPickerProps> = ({ sendGif }) => {
  const classes = useStyles();
  const giphy = new GiphyFetch(API_KEY);

  const [gifOpen, setGifOpen] = useState(false);
  const [search, setSearch] = useState<string | null>(null);

  const fetchMoreGifs = (offset: number) => {
    if (search?.trim()) {
      return giphy.search(search, { offset, limit: 10 });
    } else {
      return giphy.trending({ offset, limit: 10 });
    }
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        setGifOpen(false);
        setSearch(null);
      }}
    >
      <div className={classes.root}>
        <button
          style={{ cursor: "pointer", border: "none", background: "none" }}
          type="button"
          onClick={() => setGifOpen(!gifOpen)}
        >
          <GifLogo id="gif-logo" width={50} height={50} />
        </button>
        {gifOpen && (
          <div className={classes.dropdown}>
            <TextField
              placeholder="Type something"
              fullWidth
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              style={{ marginBottom: "15px" }}
            />
            <Grid
              key={search || "gif"}
              onGifClick={(a) => {
                sendGif(a);
                setGifOpen(false);
                setSearch(null);
              }}
              hideAttribution={true}
              noLink={true}
              fetchGifs={fetchMoreGifs}
              width={225}
              columns={2}
              gutter={6}
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
    marginBottom: "2px",
    background: "white",
    padding: "10px",
    boxShadow: "0px 0px 2px #888",
    position: "absolute",
    maxHeight: "300px",
    bottom: 28,
    right: 0,
    zIndex: 5,
    width: "250px",
    height: "300px",
    justifyContent: "flex-start",
    textAlign: "right",
    borderRadius: "5%",
    overflowY: "scroll",
  },
}));
