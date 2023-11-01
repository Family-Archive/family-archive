import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';
import { NextResponse } from 'next/server'

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
    where = lib.limitQueryByFamily(where, request.cookies, session)
    const people = await prisma.Person.findMany({
        where: where
    })

    return NextResponse.json({
        status: 'success',
        data: {
            people: people
        }
    }, {
        status: 200
    })
}

export async function POST(request, session) {
    const parameters = await request.json()

    // Validation: we need a full name to add a new person.
    if (parameters.fullName === '') {
        return NextResponse.json({
            status: 'fail',
            data: { "fullName": "A full name is required." }
        }, {
            status: 400
        })
    }

    const currFamily = request.cookies.get('familyId').value
    const newPerson = await prisma.Person.create({
        data: {
            fullName: parameters.fullName,
            shortName: parameters.shortName,
            pronouns: {
                connect: { id: parameters.pronouns }
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
