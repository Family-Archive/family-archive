import { prisma } from '@/app/db/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const recordData = await prisma.record.update({
        where: {
            id: params.id
        },
        data: {
            collections: {
                connect: {
                    id: params.collectionId
                }
            }
        }
    })

    return Response.json({ status: "success", data: { recordData } })
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const recordData = await prisma.record.update({
        where: {
            id: params.id
        },
        data: {
            collections: {
                disconnect: [
                    { id: params.collectionId }
                ]
            }
        }
    })

    return Response.json({ status: "success", data: { recordData } })
}
