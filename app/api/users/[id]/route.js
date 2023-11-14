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
    // TODO: THIS JUST DELTES THE PERSON FROM THE DB!
    // We'll need to decide what to do with records connected to people,
    // ESPECIALLY because the connection is stored in JSON in the RecordField table, not via an actual relation
    // What do we do if a record is connected to a nonexistant user? Should we clear that out here?

    // For now, we just handle nonexistant person IDs in the PersonSelector component itself.
    // If an ID in the field doesn't match anybody in the site, we just display "Deleted user" and can remove said missing user manually

    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    if (! await lib.checkPermissions(session.user.id, 'Person', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const person = await prisma.Person.delete({
        where: {
            id: params.id
        }
    })

    return NextResponse.json({
        status: 'success',
        data: {
            message: "Person deleted successfully"
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