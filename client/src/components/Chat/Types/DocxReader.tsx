import { FC } from "react";
import { TypeAdapterProps } from ".";
import { Resizable, ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';

export const DocxReader: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
  return (
    <ResizableBox width={500} height={500} resizeHandles={["w", "s", "sw", "e", "se", "ne", "nw", "n"]} lockAspectRatio={true} minConstraints={[250, 250]} >
      <iframe
        height="100%"
        width="100%"
        src={"https://view.officeapps.live.com/op/embed.aspx?wdDownloadButton=True&src=" + url}
        frameBorder="0"
      ></iframe>
    </ResizableBox>
  );
};
