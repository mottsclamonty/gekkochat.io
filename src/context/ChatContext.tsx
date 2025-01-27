"use client";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { firestore } from "../lib/firebase";
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
  name: string;
  messages: ChatMessage[];
}

export interface ChatContextType {
  messages: ChatMessage[];
  savedChats: Chat[];
  isQuerying: boolean;
  isTyping: boolean;
  isGekko: boolean;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  updateLastMessage: (content: string) => void;
  clearMessages: () => void;
  setQuerying: (querying: boolean) => void;
  loadChat: (chat: Chat) => void;
  setTyping: (typing: boolean) => void;
  toggleGekkoStyle: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [savedChats, setSavedChats] = useState<Chat[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isGekko, setIsGekko] = useState(true);

  const fetchSavedChats = async () => {
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) return;

      const userDocRef = doc(firestore, "users", userEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setSavedChats(userData.chats || []);
      } else {
        setSavedChats([]);
      }
    } catch (error) {
      console.error("Error fetching saved chats:", error);
    }
  };

  const saveNewChatToFirestore = async (newChat: Chat) => {
    try {
      const userEmail = session?.user?.email;
      if (!userEmail) return;

      const userDocRef = doc(firestore, "users", userEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const existingChats: Chat[] = userDoc.data().chats || [];

        // Check if a chat with identical messages already exists
        const isDuplicate = existingChats.some(
          (chat) =>
            JSON.stringify(chat.messages) === JSON.stringify(newChat.messages)
        );

        if (isDuplicate) {
          return;
        }

        // Save the new chat if it's not a duplicate
        await updateDoc(userDocRef, {
          chats: [...existingChats, newChat],
        });

        setSavedChats((prevChats) => [...prevChats, newChat]);
      }
    } catch (error) {
      console.error("Error saving new chat to Firestore:", error);
    }
  };

  const updateChatMessages = async (updatedMessages: ChatMessage[]) => {
    try {
      if (!chatId) return;

      const userEmail = session?.user?.email;
      if (!userEmail) return;

      const userDocRef = doc(firestore, "users", userEmail);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedChats = (userData.chats || []).map((chat: Chat) =>
          chat.id === chatId ? { ...chat, messages: updatedMessages } : chat
        );

        await updateDoc(userDocRef, { chats: updatedChats });
        setSavedChats(updatedChats);
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

      if (chatId) {
        // Update existing chat
        if (updatedMessages.length >= 4) {
          updateChatMessages(updatedMessages);
        }
      } else {
        // Create new chat if messages array reaches 4
        if (updatedMessages.length === 4) {
          const newChatId = crypto.randomUUID();
          const newChat: Chat = {
            id: newChatId,
            name: updatedMessages[0].content, // Use the first user message as the chat name
            messages: updatedMessages,
          };
          setChatId(newChatId);
          saveNewChatToFirestore(newChat);
        }
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

      if (chatId) {
        const activeChat: Chat = {
          id: chatId,
          name: updatedMessages[0]?.content || "Untitled Chat",
          messages: updatedMessages,
        };
        updateChatMessages(activeChat.messages);
      }

      return updatedMessages;
    });
  };

  const clearMessages = () => {
    setMessages([]);
    setChatId(null);
  };

  const setQuerying = (querying: boolean) => {
    setIsQuerying(querying);
  };

  const setTyping = (typing: boolean) => {
    setIsTyping(typing);
  };

  const toggleGekkoStyle = () => {
    setIsGekko((prev) => !prev);
  };

  useEffect(() => {
    if (session?.user?.email) {
      fetchSavedChats();
    }
  }, [session]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        savedChats,
        isQuerying,
        isTyping,
        isGekko,
        addMessage,
        updateLastMessage,
        clearMessages,
        setQuerying,
        loadChat: (chat: Chat) => {
          setChatId(chat.id);
          setMessages(chat.messages);
        },
        setTyping,
        toggleGekkoStyle,
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
