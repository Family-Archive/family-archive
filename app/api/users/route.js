import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server'

import crypto from 'crypto'
import bcrypt from 'bcrypt'
import nodemailer from "nodemailer"
import lib from '@/lib/lib';

// Fetch people
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const params = request.nextUrl.searchParams
    let where = params.get('search') ? { name: { contains: params.get('search') } } : {}
    const users = await prisma.User.findMany({
        where: where
    })

    return NextResponse.json({
        status: 'success',
        data: {
            users: users
        }
    }, {
        status: 200
    })
}

// Create a new user
export async function POST(request, session) {
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const data = await request.formData()
    const familiesData = JSON.parse(data.get('families'))
    const familiesIdList = familiesData.families.map(family => { return { id: family.id } })
    const shouldGeneratePassword = parseInt(data.get('emailpassword')) === 1 ? true : false

    if (!data.get('name')) {
        return NextResponse.json({
            status: 'error',
            message: "Name is a required field"
        }, {
            status: 400
        })
    }
    if (!data.get('email')) {
        return NextResponse.json({
            status: 'error',
            message: "Email is a required field"
        }, {
            status: 400
        })
    }
    if (!familiesData.defaultFamily) {
        return NextResponse.json({
            status: 'error',
            message: "Default family is a required field"
        }, {
            status: 400
        })
    }
    if (!familiesIdList) {
        return NextResponse.json({
            status: 'error',
            message: "The user must belong to at least one family"
        }, {
            status: 400
        })
    }

    let password = data.get('password')
    if (shouldGeneratePassword) {
        password = crypto.randomBytes(8).toString('hex')
    } else {
        if (password && password.length < 8) {
            return Response.json({
                status: "error",
                message: "Password must be at least eight characters long"
            }, {
                status: 400
            })
        }
    }

    const newUser = await prisma.User.create({
        data: {
            name: data.get('name'),
            email: data.get('email'),
            password: bcrypt.hashSync(password, 10),
            defaultFamily: {
                connect: {
                    id: familiesData.defaultFamily
                }
            },
            families: {
                connect: familiesIdList
            }
        }
    })

    if (shouldGeneratePassword) {
        lib.sendEmail({
            from: '"Family Archive" <familyarchive@bryceyoder.com>',
            to: data.get('email'),
            subject: "A Family Archive account has been created for you",
            html: `<b>Hi ${data.get('name')},</b> a new Family Archive account has been created for you at <a href='${process.env.NEXTAUTH_URL}'>${process.env.NEXTAUTH_URL}</a>.<br /><br />You can login with the password "<b>${password}</b>" and your email. Please set a new password after logging in.`
        })
    }

    return NextResponse.json({
        status: 'success',
        data: {
            user: newUser
        }
    }, {
        status: 201
    });
}
