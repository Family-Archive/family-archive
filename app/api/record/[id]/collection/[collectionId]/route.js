import { prisma } from '@/app/db/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import permissionLib from '@/lib/permissions/lib';

// Add a record to a collection
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

    // Make sure user can access record AND collection
    if (! await permissionLib.checkPermissions(session.user.id, 'Record', params.id) ||
        ! await permissionLib.checkPermissions(session.user.id, 'Collection', params.collectionId)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
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

// Remove a record from a collection
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

    // Make sure user can access record AND collection
    if (! await permissionLib.checkPermissions(session.user.id, 'Record', params.id) ||
        ! await permissionLib.checkPermissions(session.user.id, 'Collection', params.collectionId)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
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
