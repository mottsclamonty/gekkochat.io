"use client";
import React from "react";

import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { useChat } from "../../context/ChatContext";

const SavedChatsModal = () => {
  const { loadChat, savedChats } = useChat();

  const renderChats = () => {
    if (savedChats.length === 0) {
      return <span className="text-left p-2">You have no saved chats!</span>;
    } else {
      // Remove duplicates based on name and messages array length
      const uniqueChats = savedChats.filter(
        (chat, index, self) =>
          index ===
          self.findIndex(
            (c) =>
              c.name === chat.name && c.messages.length === chat.messages.length
          )
      );

      return uniqueChats.map((chat) => (
        <button
          key={chat.id} // Ensure each chat has a unique key
          type="button"
          onClick={() => {
            loadChat(chat);
          }}
          className="text-left p-2 border-b-[1px] last:border-b-[0px] border-slate-400 hover:bg-slate-700 hover:text-white transition hover:first:rounded-t-md hover:last:rounded-b-md"
        >
          {chat.name}
        </button>
      ));
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger className="w-full p-2 bg-slate-500 hover:bg-slate-700 text-white transition cursor-pointer text-center">
        Saved chats
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="start"
        className="flex flex-col bg-slate-200 p-0 max-h-[400px] overflow-y-auto"
      >
        {renderChats()}
      </HoverCardContent>
    </HoverCard>
  );
};

export default SavedChatsModal;
