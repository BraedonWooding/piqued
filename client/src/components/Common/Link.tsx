import { Link, makeStyles } from "@material-ui/core";
import NextLink from "next/link";
import { FC } from "react";

interface MyNextLinkProps {
  href: string;
  className?: string;
  color?: "inherit" | "primary" | "secondary";
}

export const useStyles = makeStyles(() => ({
  link: {
    cursor: "pointer",
  },
}));

export const MyLink: FC<MyNextLinkProps> = ({ children, href, ...props }) => {
  const classes = useStyles();
  return (
    <NextLink href={href} passHref>
      <Link className={classes.link} {...props}>
        {children}
      </Link>
    </NextLink>
  );
};
