import React, { ComponentPropsWithoutRef, FC, forwardRef, useEffect, useRef } from "react";
import { makeStyles } from "@material-ui/core";
import Measure from 'react-measure'

interface ScrollableMsgsProps extends ComponentPropsWithoutRef<'div'> {}

export const ScrollableMsgs = forwardRef<Measure, ScrollableMsgsProps>(({ children }, ref) => {
  const classes = useStyles();
  const bottom = useRef<HTMLDivElement>();
  useEffect(() => {
    bottom.current.scrollIntoView({ behavior: "smooth" });
  }, [children]);

  return (
    <Measure ref={ref as any} margin onResize={() => bottom.current.scrollIntoView({ behavior: "smooth" })} >
      {({ measureRef }) => (
        (<div ref={measureRef} className={classes.scrollableDiv}>
          {children}
          <div ref={bottom}></div>
        </div>)
      )}
    </Measure>
  );
});

const useStyles = makeStyles(() => ({
  scrollableDiv: {
    maxHeight: "inherit",
    height: "inherit",
    overflowY: "auto",
  },
}));
