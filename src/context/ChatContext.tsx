"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatContextType {
  messages: ChatMessage[];
  isQuerying: boolean;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setQuerying: (querying: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        ...message,
      },
    ]);
  };

  const updateLastMessage = (content: string) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        lastMessage.content = content;
      }
      return updatedMessages;
    });
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const setQuerying = (querying: boolean) => {
    setIsQuerying(querying);
  };

  return (
    <ChatContext.Provider
      value={{ messages, isQuerying, addMessage, updateLastMessage, clearMessages, setQuerying }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
};
