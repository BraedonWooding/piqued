import { FC } from "react";
import { TypeAdapterProps } from ".";

export const VideoRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
  return (
    <video width="320" height="240" controls onLoad={() => onLoad(url, type)}>
      <source src={url} type={type}/>
    </video>
  );
};
