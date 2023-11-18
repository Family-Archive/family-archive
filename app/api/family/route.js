import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Fetch all families
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

    const families = await prisma.Family.findMany()

    return NextResponse.json({
        status: 'success',
        data: {
            families: families
        }
    }, {
        status: 200
    })
}

// Create a new family
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

    let requestData = await request.formData()
    requestData = Object.fromEntries(requestData)

    if (!requestData.name) {
        return Response.json({
            'status': 'error',
            'message': 'Family Name cannot be empty'
        }, {
            status: 400
        })
    }

    const family = await prisma.family.create({
        data: {
            name: requestData.name,
            users: {
                connect: [
                    { id: session.user.id }
                ]
            }
        }
    })

    return Response.json({ status: "success", data: { family: family } })
}