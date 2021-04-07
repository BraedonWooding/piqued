import { FC } from "react";
import { TypeAdapterProps } from ".";
import GetAppIcon from "@material-ui/icons/GetApp";

export const DefaultRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
  const unique_filename = decodeURIComponent(url.substring(url.lastIndexOf("/") + 1));
  const nice_filename = unique_filename.substring(unique_filename.indexOf(":") + 1);
  return (
    <a type={type} onLoad={() => onLoad(url, type)} download={nice_filename} href={url}>
      <GetAppIcon style={{ verticalAlign: "middle" }} /> {nice_filename}
    </a>
  );
};
