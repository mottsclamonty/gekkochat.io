"use client"; // Indicates this component is for client-side rendering in Next.js

import Image from "next/image"; // Optimized image rendering in Next.js
import { Typewriter } from "react-simple-typewriter"; // Typewriter effect for assistant messages
import { useSession } from "next-auth/react"; // Hook for managing user session

// Props for the ChatMessage component
interface ChatMessageProps {
  sender: "user" | "assistant"; // Indicates if the message is from the user or the assistant
  message: string; // The content of the message
  isTyping?: boolean; // Optional: Indicates if the assistant is typing
}

// Functional component to render a chat message
const ChatMessage: React.FC<ChatMessageProps> = ({
  sender,
  message,
  isTyping = false, // Default value for `isTyping` is false
}) => {
  const { data: session } = useSession(); // Access user session data
  const isUser = sender === "user"; // Determine if the sender is the user

  return (
    <div
      className={`w-full px-4 py-2 flex items-start ${
        isUser ? "flex-row" : "flex-row-reverse" // Align messages based on sender
      }`}
    >
      {/* Profile picture for the message sender */}
      <Image
        src={isUser ? session?.user?.image ?? "" : "/gekko_profile.jpg"} // User's profile image or assistant's default image
        height={20} // Profile picture height in pixels
        width={20} // Profile picture width in pixels
        alt="sender profile picture" // Alt text for accessibility
        className="object-cover rounded-full h-12 w-12" // Styling for rounded profile pictures
      />

      {/* Message bubble */}
      <div
        className={`relative max-w-[90%] bg-white p-2 rounded-lg ${
          isUser ? "ml-4" : "mr-4" // Add margin to separate the bubble from the image
        }`}
      >
        {/* Pointer triangle for the message bubble */}
        <span
          className={`absolute top-2 h-0 w-0 border-t-[10px] border-b-[10px] ${
            isUser
              ? "left-[-10px] border-r-[10px] border-t-transparent border-b-transparent border-r-white" // Pointer on the left for user messages
              : "right-[-10px] border-l-[10px] border-t-transparent border-b-transparent border-l-white" // Pointer on the right for assistant messages
          }`}
        ></span>

        {/* Display typing animation, typewriter effect, or plain message text */}
        {isTyping ? (
          <div className="animate-pulse text-gray-500">...</div> // Typing indicator for the assistant
        ) : sender === "assistant" ? (
          <Typewriter
            words={[message]} // Assistant message with typewriter effect
            loop={1} // Play the typewriter animation once
            typeSpeed={2} // Typing speed
            delaySpeed={500} // Delay before typing starts
          />
        ) : (
          <span>{message}</span> // Plain text for user messages
        )}
      </div>
    </div>
  );
};

export default ChatMessage; // Export the component for use in the app
