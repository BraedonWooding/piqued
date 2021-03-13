import { Button, Link, makeStyles } from "@material-ui/core";
import clsx from "clsx";
import NextLink from "next/link";
import { FC } from "react";

interface MyNextLinkProps {
  href: string;
  className?: string;
  color?: "inherit" | "primary" | "secondary";
  variant?: "text" | "outlined" | "contained";
}

export const useStyles = makeStyles(() => ({
  link: {
    cursor: "pointer",
  },
}));

export const MyLink: FC<MyNextLinkProps> = ({ children, href, className }) => {
  const classes = useStyles();
  return (
    <NextLink href={href} passHref>
      <Link className={clsx(classes.link, className)}>{children}</Link>
    </NextLink>
  );
};

export const NavButtonLink: FC<MyNextLinkProps> = ({ children, href, className, color, variant }) => {
  return (
    <NextLink href={href} passHref>
      <Button className={className} color={color} variant={variant}>
        {children}
      </Button>
    </NextLink>
  );
};
