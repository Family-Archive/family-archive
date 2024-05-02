import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server'

// Upsert a nickname
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

    const data = await request.formData()
    if (!data.has('nickname')) {
        return NextResponse.json({
            status: 'error',
            message: "Nickname must be provided"
        }, {
            status: 400
        })
    }
    if (!data.get('personId')) {
        return NextResponse.json({
            status: 'error',
            message: "Person ID is required"
        }, {
            status: 400
        })
    }

    const result = await prisma.Nickname.upsert({
        where: {
            userId_personId: {
                userId: session.user.id,
                personId: data.get('personId')
            }
        },
        update: {
            name: data.get('nickname'),
        },
        create: {
            name: data.get('nickname'),
            userId: session.user.id,
            personId: data.get('personId')
        }
    })

    return NextResponse.json({
        status: 'success',
        data: {
            nickname: [result]
        }
    }, {
        status: 201
    });
}
