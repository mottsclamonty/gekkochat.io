import NextAuth, { AuthOptions, User, Session } from "next-auth";
import { JWT } from "next-auth/jwt"; // Import JWT from "next-auth/jwt"
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";

// Define the auth options
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
    async signIn({ user }: { user: User }) {
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
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (session.user && token) {
        session.user.id = token.sub as string;
      }
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }): Promise<JWT> {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

// Export the handler
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
