import { Box, makeStyles } from "@material-ui/core";
import { Add } from "@material-ui/icons";
import { useStyles } from "components/Common/FormikUI";
import React, { FC } from "react";

interface DiscoverItemProps {
  itemId;
  actionText
  itemText;
  itemIndex
  joinCallback: (itemId) => void;
}

export const DiscoverItem: FC<DiscoverItemProps> = ({ itemId, actionText, itemText, joinCallback }) => {
  const itemClasses = createStyles();
  const classes = useStyles();

  return (
    <div>
      <Box
        className={classes.avatar_root}
        onClick={() => joinCallback(itemId)}>
        {itemText} {actionText}

        {/* <div className={itemClasses.overlay}>
          <Box><Add /></Box>
          <Box>{actionText}</Box>
        </div> */}

        <Box className={classes.avatar_overlay}>
          <Box><Add /></Box>
          <Box>{actionText}</Box>
        </Box>

      </Box>
    </div>
  );
};

const createStyles = makeStyles(() => ({
  container: {
    height: "150px",
    width: "150px"
  },
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    width: "100 %",
    opacity: 0,
    transition: ".5s ease",
    backgroundColor: "#008CBA"
  }
}));

