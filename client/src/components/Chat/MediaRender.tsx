import axios from "axios";
import { FC } from "react";
import { DefaultTypeAdapter, SupportedCodeExtensions, TypeMap } from "./Types";
import { CodeRenderer } from "./Types/CodeRenderer";

interface MediaRenderProps {
  url: string;
  type?: string;
  onLoad: () => void;
}

export const MediaRender: FC<MediaRenderProps> = ({ url, type, onLoad }: MediaRenderProps) => {
  // legacy
  if (!type) {
    var isImage: boolean =
      url.endsWith("png") ||
      url.endsWith("jpg") ||
      url.endsWith("jpeg") ||
      url.endsWith("gif") ||
      url.endsWith("PNG") ||
      url.endsWith("JPG") ||
      url.endsWith("JPEG") ||
      url.endsWith("GIF");
    var isVideo: boolean = url.endsWith("mp4") || url.endsWith("MP4");
    var ext = url.substring(url.lastIndexOf(".") + 1).toLowerCase();
    type = isImage ? `image/${ext}` : isVideo ? "video/mp4" : "application/octet-stream";
  }

  let TypeAdapter = TypeMap[type] || TypeMap[type.substring(0, type.indexOf("/"))] || DefaultTypeAdapter;

  if (TypeAdapter == DefaultTypeAdapter) {
    const filename = url.substring(url.lastIndexOf("/") + 1).toLowerCase();
    if (SupportedCodeExtensions.some((c) => filename.match(c))) {
      TypeAdapter = CodeRenderer;
      type = filename;
    }
  }

  return <TypeAdapter url={url} type={type} onLoad={onLoad} />;
};
