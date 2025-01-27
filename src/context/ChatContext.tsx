"use client"; // Specifies this file is for client-side rendering in Next.js

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { firestore } from "../lib/firebase"; // Firebase Firestore instance
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Firestore methods for document interaction
import { useSession } from "next-auth/react"; // Hook for accessing NextAuth session data

// Represents a single message in a chat
export interface ChatMessage {
  id: string; // Unique identifier for the message
  role: "user" | "assistant"; // Indicates whether the message is from the user or the assistant
  content: string; // Text content of the message
  timestamp: Date; // Timestamp of when the message was created
}

// Represents a chat containing multiple messages
export interface Chat {
  id: string; // Unique identifier for the chat
  name: string; // Name of the chat (e.g., based on the first message)
  messages: ChatMessage[]; // Array of messages in the chat
}

// Interface for the context's shape and available actions
export interface ChatContextType {
  messages: ChatMessage[]; // Current list of chat messages
  savedChats: Chat[]; // List of saved chats retrieved from Firestore
  isQuerying: boolean; // Indicates if a query is currently running
  isTyping: boolean; // Indicates if the assistant is typing
  isGekko: boolean; // Custom UI style toggle state
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void; // Function to add a new message
  updateLastMessage: (content: string) => void; // Updates the content of the last assistant message
  clearMessages: () => void; // Clears the current chat messages
  setQuerying: (querying: boolean) => void; // Sets the querying state
  loadChat: (chat: Chat) => void; // Loads a saved chat into the current state
  setTyping: (typing: boolean) => void; // Sets the typing state
  toggleGekkoStyle: () => void; // Toggles the custom Gekko UI style
}

// Context for managing chat-related state and functions
const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider component for managing chat state and logic
export const ChatProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { data: session } = useSession(); // Gets the current user session
  const [messages, setMessages] = useState<ChatMessage[]>([]); // Stores current chat messages
  const [savedChats, setSavedChats] = useState<Chat[]>([]); // Stores saved chats from Firestore
  const [isQuerying, setIsQuerying] = useState(false); // Tracks if a query is running
  const [chatId, setChatId] = useState<string | null>(null); // Current chat ID
  const [isTyping, setIsTyping] = useState(false); // Tracks if the assistant is typing
  const [isGekko, setIsGekko] = useState(true); // Tracks custom Gekko UI style state

  // Fetches saved chats for the logged-in user from Firestore
  const fetchSavedChats = async () => {
    try {
      const userEmail = session?.user?.email; // Get the current user's email
      if (!userEmail) return;

      const userDocRef = doc(firestore, "users", userEmail); // Reference to the user's Firestore document
      const userDoc = await getDoc(userDocRef); // Fetch the user's document

      if (userDoc.exists()) {
        const userData = userDoc.data(); // Get user data from the document
        setSavedChats(userData.chats || []); // Set saved chats or initialize to an empty array
      } else {
        setSavedChats([]); // No document found; initialize to an empty array
      }
    } catch (error) {
      console.error("Error fetching saved chats:", error); // Log errors during the fetch operation
    }
  };

  // Saves a new chat to Firestore, ensuring no duplicates
  const saveNewChatToFirestore = async (newChat: Chat) => {
    try {
      const userEmail = session?.user?.email; // Get the current user's email
      if (!userEmail) return;

      const userDocRef = doc(firestore, "users", userEmail); // Reference to the user's Firestore document
      const userDoc = await getDoc(userDocRef); // Fetch the user's document

      if (userDoc.exists()) {
        const existingChats: Chat[] = userDoc.data().chats || []; // Get existing chats or initialize to an empty array

        // Check for duplicate chats based on identical messages
        const isDuplicate = existingChats.some(
          (chat) =>
            JSON.stringify(chat.messages) === JSON.stringify(newChat.messages)
        );

        if (isDuplicate) return; // Avoid saving duplicates

        // Add the new chat to Firestore and update the local state
        await updateDoc(userDocRef, {
          chats: [...existingChats, newChat],
        });

        setSavedChats((prevChats) => [...prevChats, newChat]); // Update local saved chats
      }
    } catch (error) {
      console.error("Error saving new chat to Firestore:", error); // Log errors during the save operation
    }
  };

  // Updates the messages of an existing chat in Firestore
  const updateChatMessages = async (updatedMessages: ChatMessage[]) => {
    try {
      if (!chatId) return; // No chat selected
      const userEmail = session?.user?.email; // Get the current user's email
      if (!userEmail) return;

      const userDocRef = doc(firestore, "users", userEmail); // Reference to the user's Firestore document
      const userDoc = await getDoc(userDocRef); // Fetch the user's document

      if (userDoc.exists()) {
        const userData = userDoc.data(); // Get user data
        const updatedChats = (userData.chats || []).map((chat: Chat) =>
          chat.id === chatId ? { ...chat, messages: updatedMessages } : chat
        );

        await updateDoc(userDocRef, { chats: updatedChats }); // Update the user's document
        setSavedChats(updatedChats); // Update local saved chats
      }
    } catch (error) {
      console.error("Error updating chat messages:", error); // Log errors during the update operation
    }
  };

  // Adds a new message to the current chat or creates a new chat if needed
  const addMessage = (message: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(), // Generate a unique ID for the message
      timestamp: new Date(), // Add a timestamp to the message
      ...message,
    };

    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages, newMessage];

      if (chatId) {
        if (updatedMessages.length >= 4) {
          updateChatMessages(updatedMessages); // Update existing chat messages
        }
      } else {
        if (updatedMessages.length === 4) {
          const newChatId = crypto.randomUUID(); // Generate a unique ID for the chat
          const newChat: Chat = {
            id: newChatId,
            name: updatedMessages[0].content, // Use the first message as the chat name
            messages: updatedMessages,
          };
          setChatId(newChatId); // Set the new chat ID
          saveNewChatToFirestore(newChat); // Save the new chat to Firestore
        }
      }

      return updatedMessages;
    });
  };

  // Updates the last assistant message's content
  const updateLastMessage = (content: string) => {
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      const lastMessage = updatedMessages[updatedMessages.length - 1]; // Get the last message
      if (lastMessage?.role === "assistant") {
        lastMessage.content = content; // Update the content
      }

      if (chatId) {
        updateChatMessages(updatedMessages); // Update chat messages in Firestore
      }

      return updatedMessages;
    });
  };

  // Clears all current messages and resets the chat ID
  const clearMessages = () => {
    setMessages([]);
    setChatId(null);
  };

  // Sets the querying state
  const setQuerying = (querying: boolean) => {
    setIsQuerying(querying);
  };

  // Sets the typing state
  const setTyping = (typing: boolean) => {
    setIsTyping(typing);
  };

  // Toggles the custom Gekko style
  const toggleGekkoStyle = () => {
    setIsGekko((prev) => !prev);
  };

  // Fetch saved chats when the session is updated
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
          setChatId(chat.id); // Set the active chat ID
          setMessages(chat.messages); // Load messages into state
        },
        setTyping,
        toggleGekkoStyle,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Hook to use the ChatContext, ensuring it is used within a provider
export const useChat = (): ChatContextType => {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
};
