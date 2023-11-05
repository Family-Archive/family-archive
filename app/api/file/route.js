import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server'
import FileStorageFactory from '@/lib/FileStorage/FileStorageFactory'

// Add a new file
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

    const formData = await request.formData()
    const currFamily = request.cookies.get('familyId').value

    // Store records for files that were successfully uploaded.
    let newFiles = []

    // Store error messages for files that failed to upload.
    let errorFiles = []

    const files = formData.getAll('file')

    for (const file of files) {
        try {
            const newFile = await storeFile(file, currFamily);
            newFiles.push(newFile)
        } catch (error) {
            errorFiles.push({
                name: file.name,
                error: error.message
            })
        }
    }

    // Remove undefined values from the array
    newFiles = newFiles.filter((newFile) => {
        return newFile !== undefined
    })

    if (newFiles.length === 0) {
        return NextResponse.json({
            status: 'error',
            message: 'None of the uploaded files could be stored.',
            data: {
                errors: errorFiles
            }
        }, {
            status: 500
        })
    }

    return NextResponse.json({
        status: 'success',
        data: {
            files: newFiles,
            errors: errorFiles
        }
    }, {
        status: 201
    })
}

async function storeFile(file, familyId) {
    const fileSystem = FileStorageFactory.instance()
    const newFile = await fileSystem.store(file, familyId)
    return newFile
}
