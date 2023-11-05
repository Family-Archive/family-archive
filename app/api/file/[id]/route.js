import fs from 'fs'
import { prisma } from "../../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import lib from '../../../../lib/lib'

// Fetch a file
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    if (! await lib.checkPermissions(session.user.id, 'File', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const fileRecord = await prisma.file.findUnique({
        where: {
            id: params.id
        }
    })
    const filePath = lib.getFilePath(fileRecord.hash)
    const file = await fs.readFileSync(filePath)

    // The response will have a custom "X-File-Name" header for convenient access
    // to the file name if you're not trying to download it as an attachment.
    const searchParams = request.nextUrl.searchParams
    return new Response(file, {
        headers: {
            "Content-Type": fileRecord.mimeType,
            "Content-Disposition": searchParams.get('download') === "true" ? `attachment; filename="${fileRecord.name}"` : "inline",
            "X-File-Name": fileRecord.name
        }
    })
}

// Update a file. Only supports changing the "caption" via formData atm
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    if (! await lib.checkPermissions(session.user.id, 'File', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    let formData = await request.formData()
    const file = await prisma.File.updateMany({
        data: {
            caption: formData.get('caption')
        },
        where: {
            id: params.id
        }
    })

    return Response.json({ status: "success", data: { file: file } })
}
