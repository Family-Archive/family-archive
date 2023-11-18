import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

// Fetch a user's information
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const user = await prisma.User.findUnique({
        where: {
            id: params.id
        },
        include: {
            accounts: {
                select: {
                    id: true,
                    type: true,
                    provider: true
                }
            },
            families: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })

    return NextResponse.json({
        status: 'success',
        data: {
            user: user
        }
    }, {
        status: 200
    })
}

export async function DELETE(request, { params }) {
    // !!!!!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!!!!
    // This route exists but isn't exposed in the front end yet because we have to figure out what should happen when a user is deleted.
    // Prisma won't even allow it if there are records attached to the user. The question is, do we update all existing resources
    // attached to a user and associate them with someone else? Or do we delete all related resources? Or do we just mark a user "deleted"
    // in the DB so that data integrity stays intact and just display all references to the user as "deleted user" on the front end?

    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const user = await prisma.User.delete({
        where: {
            id: params.id
        }
    })

    return NextResponse.json({
        status: 'success',
        data: {
            message: "User deleted successfully"
        }
    }, {
        status: 200
    })
}

// Update a user
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    let formData = await request.formData()
    const familiesData = JSON.parse(formData.get('families'))
    const familiesIdList = familiesData.families.map(family => { return { id: family.id } })

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

    let data = {
        name: formData.get('name'),
        email: formData.get('email'),
        defaultFamily: {
            connect: {
                id: familiesData.defaultFamily
            }
        },
        families: {
            set: familiesIdList
        }
    }
    if (formData.get('password')) {
        if (formData.get('password').length < 8) {
            return Response.json({
                status: "error",
                message: "Password must be at least eight characters long"
            }, {
                status: 400
            })
        }
        data['password'] = bcrypt.hashSync(formData.get('password'), 10)
    }

    const user = await prisma.User.update({
        data: data,
        where: {
            id: params.id
        }
    })

    return Response.json({ status: "success", data: { user: user } })
}