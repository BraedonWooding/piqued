import { FC } from "react";
import { TypeAdapterProps } from ".";
import GetAppIcon from "@material-ui/icons/GetApp";

export const DefaultRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
  // intentional double decode, the first decode is to unwrap the fact that we need to encode the path
  // the second decode is to decode the filename which is encoded to support utf8
  const unique_filename = decodeURIComponent(decodeURIComponent(url.substring(url.lastIndexOf("/") + 1)));
  const nice_filename = unique_filename.substring(unique_filename.indexOf(":") + 1);
  return (
    <a type={type} onLoad={() => onLoad(url, type)} download={nice_filename} href={url}>
      <GetAppIcon style={{ verticalAlign: "middle" }} /> {nice_filename}
    </a>
  );
};
