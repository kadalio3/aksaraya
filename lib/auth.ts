import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { loginSchema } from "./validators";
import prisma from "../prisma";

// Import NextAuth - handle type issues with v5 beta
// @ts-ignore - NextAuth v5 beta has type definition issues
import NextAuth from "next-auth";

// Define auth configuration
export const authOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: "jwt" as const,
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                try {
                    const { email, password } = loginSchema.parse(credentials);

                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    if (!user || !user.password) {
                        return null;
                    }

                    const isPasswordValid = await bcrypt.compare(password, user.password);

                    if (!isPasswordValid) {
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }: any) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }: any) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
    },
};

// @ts-ignore - Suppress NextAuth v5 beta type error
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);
