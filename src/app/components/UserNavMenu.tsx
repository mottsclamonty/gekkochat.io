import Image from "next/image"; // Component for optimized image rendering in Next.js
import { DropdownMenu, DropdownMenuItem } from "./ui/dropdown-menu"; // UI components for the dropdown menu
import { DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu"; // Additional dropdown components
import SavedChatsModal from "./SavedChatsModal"; // Modal component for displaying saved chats
import { useChat } from "../../context/ChatContext"; // Chat context for managing chat state
import { signOut, useSession } from "next-auth/react"; // Hooks for authentication and user session management

const UserNavMenu = () => {
  const { data: session } = useSession(); // Access user session data (e.g., user profile)
  const { clearMessages } = useChat(); // Function to clear chat messages

  return (
    <DropdownMenu>
      {/* Trigger button for the dropdown menu, displaying the user's profile picture */}
      <DropdownMenuTrigger asChild>
        <Image
          src={session?.user?.image as string} // User profile picture URL from the session
          height={50} // Image height in pixels
          width={50} // Image width in pixels
          alt="userprofile picture" // Alt text for the image
          className="cursor-pointer object-cover h-12 w-12 rounded-full" // Styling for the profile picture
        />
      </DropdownMenuTrigger>

      {/* Content of the dropdown menu */}
      <DropdownMenuContent className="w-[12rem] rounded-md p-0 bg-slate-500">
        {/* Menu item: Button to start a new chat */}
        <DropdownMenuItem className="p-0">
          <button
            type="button"
            onClick={() => {
              clearMessages(); // Clear existing chat messages
            }}
            className="w-full p-2 rounded-t-md bg-slate-500 hover:bg-slate-700 text-white transition"
          >
            Start a new chat
          </button>
        </DropdownMenuItem>

        {/* Menu item: Saved chats modal */}
        <DropdownMenuItem className="p-0">
          <SavedChatsModal />{" "}
          {/* Displays the modal with a list of saved chats */}
        </DropdownMenuItem>

        {/* Menu item: Button to sign out */}
        <DropdownMenuItem className="p-0">
          <button
            type="button"
            onClick={() => {
              clearMessages(); // Clear messages before signing out
              signOut(); // Trigger the sign-out process
            }}
            className="w-full  p-2 rounded-b-md bg-slate-500 hover:bg-slate-700 text-white transition"
          >
            Sign out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNavMenu; // Export the component for use in other parts of the application
