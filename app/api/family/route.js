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
    const headersList = headers()
    const referer = headersList.get('referer')

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

    const prismaRequest = await prisma.family.create({
        data: {
            name: requestData.name,
            users: {
                connect: [
                    { id: session.user.id }
                ]
            }
        }
    })

    // TODO: add error handling here

    return Response.redirect(new URL(referer))
}