import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { NextAuthOptions } from "next-auth";

/**
 * Have to export this instead of defining in route.ts to get past a vercel deployment issue
 */
export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user || !user.email) return false;

      const userDocRef = doc(firestore, "users", user.email);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: uuidv4(),
          name: user.name || "Unknown",
          email: user.email,
          chats: [],
        });
      }

      return true;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};
