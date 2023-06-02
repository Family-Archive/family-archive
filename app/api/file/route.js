import { NextResponse } from 'next/server'
import FileStorageFactory from '@/lib/FileStorage/FileStorageFactory'

export async function POST(request) {
    const formData = await request.formData();

    // Store records for files that were successfully uploaded.
    let newFiles = [];

    // Store error messages for files that failed to upload.
    let errorFiles = [];

    const files = formData.getAll('file');

    for (const file of files) {
        try {
            const newFile = await storeFile(file);
            newFiles.push(newFile);
        } catch (error) {
            errorFiles.push({
                name: file.name,
                error: error.message
            });
        }
    }

    // Remove undefined values from the array
    newFiles = newFiles.filter((newFile) => {
        return newFile !== undefined;
    });

    if (newFiles.length === 0) {
        return NextResponse.json({
            status: 'error',
            message: 'None of the uploaded files could be stored.',
            data: {
                errors: errorFiles
            }
        }, {
            status: 500
        });
    }

    return NextResponse.json({
        status: 'success',
        data: {
            files: newFiles,
            errors: errorFiles
        }
    }, {
        status: 201
    });
}

async function storeFile(file) {
    const fileSystem = FileStorageFactory.instance();
    const newFile = await fileSystem.store(file);
    return newFile;
}
