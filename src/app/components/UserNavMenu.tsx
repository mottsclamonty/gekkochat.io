import { DropdownMenu, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useChat } from "@/context/ChatContext";
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import React from "react";
import SavedChatsModal from "./SavedChatsModal";

const UserNavMenu = () => {
  const { data: session } = useSession();
  const { clearMessages } = useChat();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Image
          src={session?.user?.image as string}
          height={50}
          width={50}
          alt="userprofile picture"
          className="cursor-pointer object-cover h-12 w-12 rounded-full"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[12rem] rounded-md p-0 bg-slate-500">
        <DropdownMenuItem className="p-0">
          <button
            type="button"
            onClick={() => {
              clearMessages();
            }}
            className="w-full p-2 rounded-t-md bg-slate-500 hover:bg-slate-700 text-white transition"
          >
            Start a new chat
          </button>
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0">
          <SavedChatsModal />
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0">
          <button
            type="button"
            onClick={() => {
              clearMessages();
              signOut();
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

export default UserNavMenu;
