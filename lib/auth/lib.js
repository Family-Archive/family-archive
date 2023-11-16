import crypto from 'crypto'
import { prisma } from '@/app/db/prisma'
import lib from '../lib'

const sendVerificationEmail = async (email) => {
    const token = crypto.randomBytes(32).toString('hex')

    const updateUser = await prisma.user.update({
        where: {
            email: email
        },
        data: {
            emailVerified: token,
        },
    })

    await lib.sendEmail({
        from: '"Family Archive" <familyarchive@bryceyoder.com>',
        to: email,
        subject: "Please verify your email",
        html: `<b>Hi,</b><br />
            You'll need to verify your email before you can access the site.<br />
            <a href='${process.env.NEXTAUTH_URL}/auth/verifyEmail/${token}'>Please click here to verify your email.</a>
        `
    })
}

const verifyUser = async (token) => {
    if (token.length < 64) {
        return false
    }

    const user = await prisma.user.updateMany({
        where: {
            emailVerified: token
        },
        data: {
            emailVerified: "yes"
        }
    })

    if (user.count === 0) {
        return false
    }

    return true
}

const authLib = {
    sendVerificationEmail: sendVerificationEmail,
    verifyUser: verifyUser
}

export default authLib