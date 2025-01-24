"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import axios from "axios";

const ChatInput = () => {
  const { addMessage, updateLastMessage, setQuerying } = useChat();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (question.trim().length === 0 || loading) return;

    // Add user's message
    addMessage({ role: "user", content: question });

    // Add assistant's "Typing..." message
    addMessage({ role: "assistant", content: "" }); // Empty string triggers the animated ellipses
    setQuerying(true);
    setLoading(true);

    try {
      const { data } = await axios.post("/api/chatbot", { question });
      updateLastMessage(data.summary || "No response available"); // Update ellipses with API response
    } catch (error) {
      console.error("Error sending question", error);
      updateLastMessage("An error occurred. Please try again.");
    } finally {
      setQuerying(false);
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex items-center ">
      <Input
        type="text"
        value={question}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setQuestion(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend();
          }
        }}
        className="w-full relative pr-12"
        placeholder="Start typing a prompt or question to get started"
        disabled={loading}
      />
      <button
        type="button"
        className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center -translate-x-[30px]"
        onClick={handleSend}
        disabled={loading}
      >
        <ArrowRight height={14} width={14} />
      </button>
    </div>
  );
};

export default ChatInput;
