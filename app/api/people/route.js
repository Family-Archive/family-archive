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

    const params = request.nextUrl.searchParams
    let where = params.get('search') ? { fullName: { contains: params.get('search') } } : {}
    where = lib.limitQueryByFamily(where, request.cookies, session.familyId)
    const people = await prisma.Person.findMany({
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
    if (!data.get('pronouns')) {
        return NextResponse.json({
            status: 'error',
            message: "Pronouns is a required field"
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
            pronouns: {
                connect: { id: data.get('pronouns') }
            },
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
