import { FC } from "react";
import { TypeAdapterProps } from ".";

export const ImageRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
    return (
        <img src={url} min-width="40%" onLoad={() => onLoad(url, type)} />
    );
};
