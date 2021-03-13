import { makeStyles } from "@material-ui/core";
import { FC } from "react";

export const Layout: FC = ({ children }) => {
  const classes = useStyles();
  return (
    <div className={classes.content}>
      {children}
    </div>
  );
};

const useStyles = makeStyles((theme) => ({
  content: {
    display: "flex",
    minHeight: "100vh",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "calc(10px + 2vmin)",
    padding: theme.spacing(3),
  },
}));
