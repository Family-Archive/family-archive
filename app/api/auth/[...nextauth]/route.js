import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "../../../db/prisma"
import bcrypt from 'bcrypt'

import lib from "@/lib/lib"
import authLib from "@/lib/auth/lib"

export const authOptions = {
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            id: "login",
            name: "credentialsLogin",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                const user = await prisma.User.findUnique({
                    where: { email: credentials.email },
                })

                // If a user with email exists and pw matches,
                // check that either email verification is turned off OR their email has been verified
                // if one of these cases fails then instead of logging in the user, send the verification email
                if (user && bcrypt.compareSync(credentials.password, user.password)) {
                    if ((await lib.getSetting('requireemailverification')) === 'no' || user.emailVerified === 'yes') {
                        return user
                    } else {
                        await authLib.sendVerificationEmail(user.email)
                        throw new Error("You need to verify your email before you can login. Please check your email for a verification link.")
                    }
                }

                throw new Error("Incorrect username or password.")
            }
        }),

        CredentialsProvider({
            id: "signup",
            name: "credentialsSignup",
            credentials: {
                email: { label: "Email", type: "text", placeholder: "" },
                name: { label: "Name", type: "text", placeholder: "" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                // Create the user
                const family = await prisma.family.findFirst()
                const user = await prisma.User.create({
                    data: {
                        email: credentials.email,
                        name: credentials.name,
                        password: bcrypt.hashSync(credentials.password, 10),
                        defaultFamilyId: family.id,
                        families: { connect: { id: family.id } }
                    }
                })

                // If email verification is not required, they can login right away. Otherwise return null
                if ((await lib.getSetting('requireemailverification')) === 'no') {
                    return user
                }

                throw new Error("Your account has been created, but you need to verify your email before logging in. Please check your email for a verification link.")
            }
        }),

        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,

            // With the following option, users logging in with OAuth can connect to existing User accounts
            allowDangerousEmailAccountLinking: true,

            async profile(profile) {

                // If allow self reg is not enabled, check an account already exists
                const allowSelfRegistration = (await lib.getSetting('allowselfregistration'))
                if (allowSelfRegistration !== 'yes') {
                    const user = await prisma.User.findUnique({
                        where: { email: profile.email }
                    })
                    if (!user) {
                        return null
                    }
                }

                const family = await prisma.family.findFirst()
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
                session.user.isAdmin = fetchedUser.isAdmin
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