import { FC, React } from "react";

interface MediaRenderProps {
  url: string;
  isRight: boolean;
}

const MediaRender: FC<MediaRenderProps> = ({ url, isRight }: MediaRenderProps) => {
  const align = isRight ? "right" : "left";
  const justify = isRight ? "flex-end" : "flex-start";
  const isImage: boolean = url.endsWith("png") || url.endsWith("jpg") || url.endsWith("jpeg") || url.endsWith("gif");
  const isVideo: boolean = url.endsWith("mp4");
  if (isImage) {
    return (
      <div style={{ textAlign: align, justifyContent: justify }}>
        <img src={url} width="20%" />
      </div>
    );
  } else if (isVideo) {
    return (
      <div style={{ textAlign: align, justifyContent: justify }}>
        <video width="20%" autoPlay={true} muted={true}>
          <source src={url} />
        </video>
      </div>
    );
  } else {
    return null;
  }
};

export default MediaRender;
