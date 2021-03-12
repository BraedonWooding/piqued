import { FC } from "react";

interface ChatMessageProps {
  position: string;
  message: string;
}

export const ChatMessage: FC<ChatMessageProps> = ({ position = "left", message }) => {
  const isRight = position.toLowerCase() === "right";
  const align = isRight ? "text-right" : "text-left";
  const justify = isRight ? "justify-content-end" : "justify-content-start";

  return (
    <div className={`w-100 my-1 d-flex ${justify}`}>
      <div className="bg-light rounded border border-gray p-2" style={{ maxWidth: "70%", flexGrow: 0 }}>
        <span
          className={`d-block text-secondary ${align}`}
          style={{ fontWeight: 500, lineHeight: 1.4, whiteSpace: "pre-wrap" }}
        >
          {message}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;
