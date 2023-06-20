import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../db/prisma"

const family = await prisma.family.findFirst({
    where: { name: 'Default' },
})

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            profile(profile) {
                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    familyId: family.id
                }
            }
        }),
    ],
    pages: {
        signIn: '/auth/login'
    },
    callbacks: {
        session: async ({ session, token, user }) => {
            if (session?.user) {
                session.user.id = user.id
                session.user.familyId = user.familyId
            }
            return session
        }
    }
}

const handler = NextAuth(authOptions)

export {
    handler as GET,
    handler as POST
}