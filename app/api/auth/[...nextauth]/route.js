import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../db/prisma"
import bcrypt from 'bcrypt'

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    debug: true,
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                const user = await prisma.User.findUnique({
                    where: { email: credentials.email },
                })

                if (user && bcrypt.compareSync(credentials.password, user.password)) {
                    // Any object returned will be saved in `user` property of the JWT
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    console.log('nah')
                    return null

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
        }),
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,

            // With the following option, users logging in with OAuth can connect to existing User accounts
            allowDangerousEmailAccountLinking: true,

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

                let fetchedUser
                if (!user) {
                    fetchedUser = await prisma.User.findUnique({
                        where: { email: session.user.email },
                        include: { families: true }
                    })
                } else {
                    fetchedUser = await prisma.user.findUnique({
                        where: { id: user.id },
                        include: { families: true }
                    })
                }

                let defaultFamily
                for (let family of fetchedUser.families) {
                    if (family.id == fetchedUser.defaultFamilyId) {
                        defaultFamily = family
                    }
                }

                session.user.id = fetchedUser.id
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