import { makeStyles } from "@material-ui/core";
import { FC } from "react";

export const FullyCenteredLayout: FC = ({ children }) => {
  const classes = useStyles();
<<<<<<< HEAD
  return <div className={classes.fullyCenteredContent}>{children}</div>;
};

export const HorizontallyCenteredLayout: FC = ({ children }) => {
  const classes = useStyles();
  return <div className={classes.horizontallyCenteredContent}>{children}</div>;
=======
  return (
    <div className={classes.content}>
      {children}
    </div>
  );
>>>>>>> origin/main
};

const useStyles = makeStyles((theme) => ({
  fullyCenteredContent: {
    display: "flex",
    minHeight: "100vh",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "calc(10px + 2vmin)",
    padding: theme.spacing(3),
  },
  horizontallyCenteredContent: {
    display: "flex",
    minHeight: "100vh",
    flexDirection: "column",
    justifyContent: "start",
    alignItems: "center",
    fontSize: "calc(10px + 2vmin)",
    padding: theme.spacing(3),
  },
}));
