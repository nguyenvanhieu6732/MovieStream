import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "user" | "admin";
    };
  }
  interface JWT {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: "user" | "admin";
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: { params: { prompt: "select_account" } },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || "",
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) return null;

        const isValid = await bcrypt.compare(credentials.password, user.hashedPassword);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email ?? undefined,
          image: user.image ?? undefined,
          role: user.role ?? "user", // Hoặc lấy từ database nếu có trường role
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
  },

  callbacks: {
    async jwt({ token, user }) {
      // LẦN ĐẦU LOGIN
      if (user) {
        token.id = user.id
        token.role = user.role
        token.image = user.image
        return token
      }

      if (!token.id) return token

      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
        },
      })

      if (!dbUser) return token

      token.name = dbUser.name
      token.email = dbUser.email
      token.image = dbUser.image
      token.role = dbUser.role

      return token
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.role = token.role as "user" | "admin"
      }
      return session
    },
    async signIn({ user }) {
      if (!user?.id) return false

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          isBanned: true,
          isDeleted: true,
        },
      })

      if (!dbUser) return false

      // ❌ BỊ BAN / DELETE
      if (dbUser.isBanned || dbUser.isDeleted) {
        throw new Error("ACCOUNT_DISABLED")
      }

      return true

    },
    secret: process.env.NEXTAUTH_SECRET,
  },
};

  const handler = NextAuth(authOptions);
  export { handler as GET, handler as POST };