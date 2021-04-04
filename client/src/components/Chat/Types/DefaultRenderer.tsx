import { FC } from "react";
import { TypeAdapterProps } from ".";
import GetAppIcon from "@material-ui/icons/GetApp";

export const DefaultRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
  function forceDownload(blob, filename) {
    var a = document.createElement("a");
    a.download = filename;
    a.href = blob;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  const unique_filename = decodeURIComponent(url.substring(url.lastIndexOf("/") + 1));
  let nice_filename = unique_filename.substring(unique_filename.indexOf(":") + 1);
  return (
    <a type={type} download={nice_filename} href={url}>
      <GetAppIcon style={{ verticalAlign: "middle" }} /> {nice_filename}
    </a>
  );
};
