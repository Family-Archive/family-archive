import { NextResponse } from 'next/server'
import { prisma } from '@/app/db/prisma'

/**
 * Returns metadata for a particular file.
 */
export async function GET(request, { params }) {
    const file = await prisma.File.findUnique({
        where: {
            id: params.id
        }
    })

    if (!file) {
        return NextResponse.json({
            status: 'error',
            error: 'The requested file could not be found.'
        }, {
            status: 400
        })
    }

    const filePath = `${process.env.BASE_URL}/api/file/${params.id}/content`

    return NextResponse.json({
        status: 'success',
        data: {
            file: {
                id: params.id,
                name: file.name,
                mimeType: file.mimeType,
                path: filePath
            }
        }
    }, {
        status: 200
    })
}