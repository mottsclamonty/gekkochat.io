"use client";
import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import { useChat } from "../../context/ChatContext";

const ChatHistory = () => {
  const { messages, isTyping } = useChat();

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <div
        ref={containerRef}
        className="flex flex-col items-start gap-4 overflow-y-auto flex-grow p-4"
      >
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            sender={message.role}
            message={message.content}
            isTyping={message.content === "" && message.role === "assistant"} // Show animated ellipses if content is empty
          />
        ))}
        {isTyping && (
          <div className="flex gap-2 mx-auto text-2xl mt-4">
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-typing-dot-1"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-typing-dot-2"></span>
            <span className="w-2 h-2 bg-gray-500 rounded-full animate-typing-dot-3"></span>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatHistory;
