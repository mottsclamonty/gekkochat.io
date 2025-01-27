"use client"; // Indicates this component is for client-side rendering in Next.js

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"; // Components for the hover card UI
import { useChat } from "../../context/ChatContext"; // Chat context for accessing chat state and functions
import { ArrowLeft } from "lucide-react"; // Icon for the "Saved chats" trigger button

const SavedChatsModal = () => {
  // Extract `loadChat` (to load a selected chat) and `savedChats` (list of saved chats) from the ChatContext
  const { loadChat, savedChats } = useChat();

  // Function to render the list of saved chats
  const renderChats = () => {
    // If no saved chats exist, display a message to the user
    if (savedChats.length === 0) {
      return <span className="text-left p-2">You have no saved chats!</span>;
    } else {
      // Remove duplicate chats based on name and message count
      // This serves as a temporary fix for an issue with duplicate chat creation
      const uniqueChats = savedChats.filter(
        (chat, index, self) =>
          index ===
          self.findIndex(
            (c) =>
              c.name === chat.name && c.messages.length === chat.messages.length
          )
      );

      // Map over the filtered unique chats and render each as a button
      return uniqueChats.map((chat) => (
        <button
          key={chat.id} // Unique key for each chat
          type="button"
          onClick={() => {
            loadChat(chat); // Load the selected chat into the context
          }}
          className="text-left p-2 border-b-[1px] last:border-b-[0px] border-slate-400 hover:bg-slate-700 hover:text-white transition hover:first:rounded-t-md hover:last:rounded-b-md"
        >
          {chat.name} {/* Display the chat's name */}
        </button>
      ));
    }
  };

  return (
    <HoverCard>
      {/* Trigger button to open the hover card */}
      <HoverCardTrigger className="flex items-center justify-center gap-2 w-full p-2 bg-slate-500 hover:bg-slate-700 text-white transition cursor-pointer text-center">
        <ArrowLeft height={14} width={14} className="text-white" />{" "}
        {/* Left arrow icon */}
        Saved chats
      </HoverCardTrigger>
      {/* Content of the hover card displaying the list of saved chats */}
      <HoverCardContent
        side="right" // Position the content to the right of the trigger
        align="start" // Align content to the start
        className="flex flex-col bg-slate-200 p-0 max-h-[400px] overflow-y-auto"
      >
        {renderChats()} {/* Render the list of saved chats */}
      </HoverCardContent>
    </HoverCard>
  );
};

export default SavedChatsModal; // Export the component for use in the app
