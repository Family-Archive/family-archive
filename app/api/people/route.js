import { prisma } from '@/app/db/prisma'
import { NextResponse } from 'next/server'
import lib from '@/lib/lib'

export async function GET(request) {
    const people = await prisma.Person.findMany()
    return NextResponse.json({
        status: 'success',
        data: {
            people: people
        }
    }, {
        status: 200
    })
}

export async function POST(request) {
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

    const currentFamilyId = await lib.getCurrentFamilyId()

    const newPerson = await prisma.Person.create({
        data: {
            fullName: parameters.fullName,
            shortName: parameters.shortName,
            pronouns: {
                connect: { id: parameters.pronouns }
            },
            family: {
                connect: { id: currentFamilyId }
            }
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