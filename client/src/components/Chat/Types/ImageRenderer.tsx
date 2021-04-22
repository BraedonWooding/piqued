import { FC } from "react";
import { TypeAdapterProps } from ".";

export const ImageRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
    return (
        <img src={url} style={{maxWidth: "40%"}} max-width="40%" onLoad={() => onLoad(url, type)} />
    );
};
