import { FC } from "react";
import { TypeAdapterProps } from ".";
import { Link } from "@material-ui/core";

export const FeedRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
    return (
        <Link target="_blank" href={decodeURIComponent(url)} color="primary">
            {type.substring(type.indexOf("/") + 1)}
        </Link>
    );
};
