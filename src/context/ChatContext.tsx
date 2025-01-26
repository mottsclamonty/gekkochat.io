"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { firestore } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Chat {
  id: string;
  name: string; // The first prompt from the user
  messages: ChatMessage[];
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
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);

  const createNewChat = async (
    firstPromptContent: string,
    messages: ChatMessage[]
  ) => {
    try {
      const newChatId = crypto.randomUUID();
      const newChat: Chat = {
        id: newChatId,
        name: firstPromptContent,
        messages,
      };

      const userEmail = session?.user.email;
      if (!userEmail) {
        console.error("User email is missing from session");
        return;
      }

      const userDocRef = doc(firestore, "users", userEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        await updateDoc(userDocRef, {
          chats: [...(userDoc.data()?.chats || []), newChat],
        });
        console.log(`New chat created with ID: ${newChatId}`);
        setChatId(newChatId);
      } else {
        console.error(`User document does not exist for email: ${userEmail}`);
      }
    } catch (error) {
      console.error("Error creating a new chat:", error);
    }
  };

  const updateChatMessages = async (updatedMessages: ChatMessage[]) => {
    try {
      if (!chatId) {
        console.error("No chat ID available for updating messages");
        return;
      }

      const userEmail = session?.user.email;
      if (!userEmail) {
        console.error("User email is missing from session");
        return;
      }

      const userDocRef = doc(firestore, "users", userEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedChats = (userData.chats || []).map(
          (chat: Chat) =>
            chat.id === chatId
              ? { ...chat, messages: updatedMessages } // Update the messages array for the current chat
              : chat // Keep other chats unchanged
        );

        await updateDoc(userDocRef, {
          chats: updatedChats,
        });

        console.log(`Messages updated for chat ID: ${chatId}`);
      } else {
        console.error(`User document does not exist for email: ${userEmail}`);
      }
    } catch (error) {
      console.error("Error updating chat messages:", error);
    }
  };

  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...message,
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];

      if (updatedMessages.length === 1 && message.role === "user") {
        return [newMessage];
      } else if (updatedMessages.length === 2) {
        createNewChat(updatedMessages[0].content, updatedMessages); // Create a new chat only after the first response
      } else {
        updateChatMessages(updatedMessages);
      }

      return updatedMessages;
    });
  };

  const updateLastMessage = (content: string) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      if (lastMessage?.role === "assistant") {
        lastMessage.content = content;
      }

      updateChatMessages(updatedMessages);

      return updatedMessages;
    });
  };

  const clearMessages = () => {
    setMessages([]);
    setChatId(null); // Reset the chat ID so the next prompt creates a new chat
  };

  const setQuerying = (querying: boolean) => {
    setIsQuerying(querying);
  };

  return (
    <ChatContext.Provider
      value={{
        messages,
        isQuerying,
        addMessage,
        updateLastMessage,
        clearMessages,
        setQuerying,
      }}
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
