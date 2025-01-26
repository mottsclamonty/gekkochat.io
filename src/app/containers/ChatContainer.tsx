"use client";
import React from "react";
import LogoHeader from "../components/LogoHeader";
import ChatHistory from "../components/ChatHistory";
import ChatInput from "../components/ChatInput";

const ChatContainer = () => {
  return (
    <div className="h-screen flex flex-col">
      {/* Fixed header */}
      <LogoHeader />
      <div className="flex flex-col flex-grow overflow-hidden w-[95%] max-w-[65rem] mx-auto bg-slate-100 rounded-md mb-4 md:mb-8 pb-4 pl-4">
        <ChatHistory />

        <ChatInput />
      </div>
    </div>
  );
};

export default ChatContainer;
