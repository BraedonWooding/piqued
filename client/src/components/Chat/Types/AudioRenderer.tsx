import { FC } from "react";
import { TypeAdapterProps } from ".";

export const AudioRenderer: FC<TypeAdapterProps> = ({ url, type, onLoad }: TypeAdapterProps) => {
    return (
        <audio controls src={url} min-width="40%" onLoad={() => onLoad(url, type)} />
    );
};
