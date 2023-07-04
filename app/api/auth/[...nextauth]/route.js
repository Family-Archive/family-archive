import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../db/prisma"

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
            async profile(profile) {
                const family = await prisma.family.findFirst({
                    where: { name: 'Default' },
                })

                return {
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    defaultFamilyId: family.id,
                    families: { connect: { id: family.id } }
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
                const fetchedUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: { families: true }
                })

                let defaultFamily
                for (let family of fetchedUser.families) {
                    if (family.id == user.defaultFamilyId) {
                        defaultFamily = family
                    }
                }

                session.user.id = user.id
                session.user.families = fetchedUser.families
                session.user.defaultFamily = defaultFamily
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