import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/permissions/lib'
import { NextResponse } from 'next/server'

// Fetch permissions for a resource
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
    const resourceType = params.get('resourceType')
    const resourceId = params.get('resourceId')
    const userId = session.user.id
    const permission = params.get('permission')

    if (! await lib.checkPermissions(userId, resourceType, resourceId, 'edit')) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const permissions = await prisma.Permission.findMany({
        where: {
            resourceId: resourceId,
            resourceType: resourceType,
            permission: permission
        },
        include: {
            user: true,
        },
    })

    return NextResponse.json({
        status: 'success',
        data: {
            permissions: permissions
        }
    }, {
        status: 200
    })
}

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

    const resourceType = data.get('resourceType')
    const resourceId = data.get('resourceId')
    const permission = data.get('permission')
    const userId = session.user.id

    if (! await lib.checkPermissions(userId, resourceType, resourceId, 'edit')) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const usersToAdd = JSON.parse(data.get('users'))
    let prismaData = []
    for (let user of usersToAdd) {
        prismaData.push({
            userId: user.id,
            resourceType: resourceType,
            resourceId: resourceId,
            permission: permission,
            type: user.type
        })
    }

    // Remove all existing permissions for item and type before re-adding
    await prisma.Permission.deleteMany({
        where: {
            resourceId: resourceId,
            resourceType: resourceType,
            permission: permission
        }
    })
    const permissions = await prisma.Permission.createMany({
        data: prismaData,
        skipDuplicates: true
    })

    return NextResponse.json({
        status: 'success',
        data: {
            message: "Permissions updated successfully!"
        }
    }, {
        status: 200
    })
}
