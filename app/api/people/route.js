import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';
import { NextResponse } from 'next/server'
import permissionLib from '@/lib/permissions/lib';

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

    // Allow searching by full name OR an assigned nickname
    const params = request.nextUrl.searchParams
    let where = params.get('search') ? {
        OR: [
            {
                fullName: {
                    contains: params.get('search')
                }
            },
            {
                Nickname: {
                    some: {
                        name: {
                            contains: params.get('search')
                        },
                        // only match nicknames that belong to this user
                        userId: session.user.id
                    }
                }
            }
        ]
    } : {}

    where = lib.limitQueryByFamily(where, request.cookies, session.familyId)
    const people = await prisma.Person.findMany({
        include: {
            Nickname: {
                where: {
                    userId: session.user.id
                }
            },
            parents: true,
            children: true,
            indirectRelationships: {
                include: {
                    relationshipType: true,
                    people: true,
                }
            },
        },
        where: where
    })

    // Only return people this user can view
    let readablePeople = []
    for (let person of people) {
        if (await permissionLib.checkPermissions(session.user.id, 'Person', person.id, 'read')) {
            readablePeople.push(person)
        }
    }

    return NextResponse.json({
        status: 'success',
        data: {
            people: readablePeople
        }
    }, {
        status: 200
    })
}

// Create a new person
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    // Validation: we need a full name to add a new person.
    const data = await request.formData()
    if (!data.get('fullName')) {
        return NextResponse.json({
            status: 'error',
            message: "Full name is a required field"
        }, {
            status: 400
        })
    }

    const currFamily = request.cookies.get('familyId').value
    if (!currFamily) {
        return NextResponse.json({
            status: 'error',
            message: "Family not specified"
        }, {
            status: 400
        })
    }

    const newPerson = await prisma.Person.create({
        data: {
            fullName: data.get('fullName'),
            shortName: data.get('shortName') || "",
            userCreated: {
                connect: {
                    id: session.user.id
                }
            },
            family: {
                connect: {
                    id: currFamily
                }
            },
        }
    })
    return NextResponse.json({
        status: 'success',
        data: {
            people: [newPerson]
        }
    }, {
        status: 201
    });
}
