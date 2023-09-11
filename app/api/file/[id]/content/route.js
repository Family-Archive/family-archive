import { NextResponse } from 'next/server'
import FileStorageFactory from '@/lib/FileStorage/FileStorageFactory'
import { prisma } from '@/app/db/prisma'

/**
 * Returns the contents of a file in storage.
 */
export async function GET(request, { params }) {
    const fileSystem = FileStorageFactory.instance()
    const fileBuffer = await fileSystem.loadFile(params.id)

    const file = await prisma.File.findUnique({
        where: {
            id: params.id
        }
    })


    console.log('File: ', file)
    console.log('File buffer: ', fileBuffer)

    if (!fileBuffer || !file) {
        return NextResponse.json({
            status: 'error',
            error: 'The requested file could not be found.'
        }, {
            status: 400
        })
    }

    const response = new NextResponse(fileBuffer)
    response.headers.set('Content-Type', file.mimeType)
    return response
}