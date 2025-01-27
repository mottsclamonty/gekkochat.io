"use client"; // Indicates this component is for client-side rendering in Next.js

import { useState } from "react";
import { Input } from "./ui/input"; // Custom input component
import { ArrowRight } from "lucide-react"; // Icon for the send button
import { useChat } from "../../context/ChatContext"; // Chat context to manage chat state
import axios from "axios"; // HTTP client for API requests

const ChatInput = () => {
  // Extract functions and state from the ChatContext
  const { addMessage, setQuerying, setTyping, isGekko } = useChat();

  // State for the input field's value
  const [question, setQuestion] = useState("");
  // State to track the loading status of the API request
  const [loading, setLoading] = useState(false);

  // Handles sending the user's question to the chatbot API
  const handleSend = async () => {
    // Prevent sending empty input or making multiple requests while loading
    if (question.trim().length === 0 || loading) return;

    // Add the user's question to the chat
    addMessage({ role: "user", content: question });

    // Set loading and querying states and indicate the assistant is typing
    setQuerying(true);
    setLoading(true);
    setTyping(true);

    try {
      // Send the question and `isGekko` style preference to the chatbot API
      const { data } = await axios.post("/api/chatbot", { question, isGekko });

      // Add the assistant's response to the chat
      addMessage({
        role: "assistant",
        content: data.summary || "No response available",
      });
    } catch (error) {
      console.error("Error sending question to chatbot API:", error); // Log errors to the console

      // Add an error message from the assistant
      addMessage({
        role: "assistant",
        content: "An error occurred. Please try again.",
      });
    } finally {
      // Reset loading and typing states and clear the input field
      setQuerying(false);
      setLoading(false);
      setTyping(false);
      setQuestion("");
    }
  };

  return (
    <div className="flex items-center">
      {/* Input field for typing a question */}
      <Input
        type="text"
        value={question}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setQuestion(e.target.value); // Update the question state on input change
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSend(); // Send the question when the Enter key is pressed
          }
        }}
        className="w-full relative pr-12" // Full-width input with padding for the button
        placeholder="Start typing a prompt or question to get started" // Placeholder text
        disabled={loading} // Disable input while loading
      />
      {/* Send button */}
      <button
        type="button"
        className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center -translate-x-[30px]"
        onClick={handleSend} // Send the question on button click
        disabled={loading} // Disable button while loading
      >
        <ArrowRight height={14} width={14} /> {/* Icon for the button */}
      </button>
    </div>
  );
};

export default ChatInput; // Export the component for use elsewhere in the app
