"use client";
import Image from "next/image";
import { Typewriter } from "react-simple-typewriter";
import { useSession } from "next-auth/react";

interface ChatMessageProps {
  sender: "user" | "assistant";
  message: string;
  isTyping?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  message,
  isTyping = false,
}) => {
  const { data: session } = useSession();
  const isUser = sender === "user";

  return (
    <div
      className={`w-full px-4 py-2 flex items-start ${
        isUser ? "flex-row" : "flex-row-reverse"
      }`}
    >
      <Image
        src={isUser ? session?.user?.image ?? "" : "/gekko_profile.jpg"}
        height={20}
        width={20}
        alt="sender profile picture"
        className="object-cover rounded-full h-12 w-12"
      />

      <div
        className={`relative max-w-[90%] bg-white p-2 rounded-lg ${
          isUser ? "ml-4" : "mr-4"
        }`}
      >
        <span
          className={`absolute top-2 h-0 w-0 border-t-[10px] border-b-[10px] ${
            isUser
              ? "left-[-10px] border-r-[10px] border-t-transparent border-b-transparent border-r-white"
              : "right-[-10px] border-l-[10px] border-t-transparent border-b-transparent border-l-white"
          }`}
        ></span>
        {isTyping ? (
          <div className="animate-pulse text-gray-500">...</div>
        ) : sender === "assistant" ? (
          <Typewriter
            words={[message]}
            loop={1}
            typeSpeed={2}
            delaySpeed={500}
          />
        ) : (
          <span>{message}</span> // no typewriter for user
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
