import NextAuth, { NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import prisma from "@/lib/prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      credentials: {
        identity: {},
        password: {},
        role: {},
      },
      async authorize(credentials) {
        if (!credentials) return null

        const identity = credentials.identity as string
        const password = credentials.password as string
        const role = credentials.role as "pengguna" | "staff"

        if (role === "pengguna") {
          const user = await prisma.pengguna.findUnique({
            where: { email: identity },
          })
          if (!user || !await bcrypt.compare(password, user.password)) return null

          return {
            id: user.id_pengguna,
            name: user.nama_pengguna,
            email: user.email,
            role: "pengguna" as const,
          }

        } else if (role === "staff") {
          const user = await prisma.staff.findUnique({
            where: { username: identity },
          })
          if (!user || !await bcrypt.compare(password, user.password)) return null

          return {
            id: user.id_staff,
            name: user.nama_staff,
            email: null,
            role: "staff" as const,
          }
        }

        return null
      }
    })
  ],

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as "pengguna" | "staff"
      return session
    }
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.BETTER_AUTH_SECRET,
}

export default NextAuth(authOptions)