import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';
import { NextResponse } from 'next/server'

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

    return NextResponse.json({
        status: 'success',
        data: {
            people: people
        }
    }, {
        status: 200
    })
}

// Create a new person
export async function POST(request, session) {
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
    if (data.get('fullName') === '') {
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
            fullName: data.get('fullName'),
            shortName: data.get('shortName'),
            pronouns: {
                connect: { id: data.get('pronouns') }
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
