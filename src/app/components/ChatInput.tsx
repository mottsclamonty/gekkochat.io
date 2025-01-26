"use client";
import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import axios from "axios";
import { useChat } from "../../context/ChatContext";
import { Input } from "./ui/input";
const ChatInput = () => {
  const { addMessage, setQuerying, setTyping } = useChat();
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (question.trim().length === 0 || loading) return;

    // Add the user's message
    console.log("User message sent:", question);
    addMessage({ role: "user", content: question });

    setQuerying(true);
    setLoading(true);
    setTyping(true); // Start typing animation

    try {
      // Call the chatbot API
      const { data } = await axios.post("/api/chatbot", { question });

      console.log("Assistant response received:", data.summary);

      // Update assistant's message with the API response
      addMessage({
        role: "assistant",
        content: data.summary || "No response available",
      });
    } catch (error) {
      console.error("Error sending question to chatbot API:", error);

      // Handle error response gracefully
      addMessage({
        role: "assistant",
        content: "An error occurred. Please try again.",
      });
    } finally {
      setQuerying(false);
      setLoading(false);
      setTyping(false); // Stop typing animation
      setQuestion(""); // Clear input field
    }
  };

  return (
    <div className="flex items-center">
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
