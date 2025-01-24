"use client";
import { useSession } from "next-auth/react";
import ChatContainer from "./containers/ChatContainer";
import SignInContainer from "./containers/SignInContainer";

export default function Home() {
  const { data: session } = useSession();
  if (session) {
    return <ChatContainer />;
  }
  return <SignInContainer />;
}
