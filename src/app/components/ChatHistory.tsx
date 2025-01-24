"use client";
import React, { useEffect, useRef } from "react";
import { useChat } from "@/context/ChatContext";
import ChatMessage from "./ChatMessage";

const ChatHistory = () => {
  const { messages } = useChat();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex flex-col items-start gap-4 overflow-y-auto flex-grow p-4">
      {messages.map((message, index) => (
        <ChatMessage
          key={message.id}
          sender={message.role}
          message={message.content}
          isTyping={message.content === "" && message.role === "assistant"} // Show animated ellipses if content is empty
        />
      ))}
    </div>
  );
};

export default ChatHistory;
