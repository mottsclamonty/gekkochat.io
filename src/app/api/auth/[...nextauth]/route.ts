import NextAuth, { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid"; // For generating UUIDs
import { firestore } from "@/lib/firebase";

export const authOptions: AuthOptions = {
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
    /**
     * Custom signIn callback to also create a user object in firestore database
     */
    async signIn({ user }) {
      if (!user || !user.email) {
        console.error("No user or email provided during sign-in.");
        return false;
      }

      try {
        const userDocRef = doc(firestore, "users", user.email);
        const userDoc = await getDoc(userDocRef);

        // Init new user
        if (!userDoc.exists()) {
          const newUser = {
            id: uuidv4(),
            name: user.name || "Unknown",
            email: user.email,
            chats: [],
          };

          await setDoc(userDocRef, newUser);
        }
      } catch (error) {
        console.error("Error creating user in Firestore:", error);
        return false;
      }

      return true;
    },

    /**
     * Basic session and jwt callbacks
     */
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

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
