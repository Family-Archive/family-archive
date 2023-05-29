import { NextResponse } from 'next/server'
import FileStorageFactory from '@/lib/FileStorage/FileStorageFactory'

export async function POST(request) {
    const formData = await request.formData();
    // Store success or error messages for each uploaded file.
    let fileStatuses = [];

    const files = formData.getAll('file');

    for (const file of files) {
        const fileStatus = await storeFile(file);
        fileStatuses.push(fileStatus);
    }

    // Remove undefined values from the array
    fileStatuses = fileStatuses.filter((fileStatus) => {
        return fileStatus !== undefined;
    });

    return NextResponse.json({
        fileStatuses: fileStatuses
    });
}

async function storeFile(file) {
    const fileSystem = FileStorageFactory.instance();

    try {
        const newFile = await fileSystem.store(file);

        return {
            fileName: file.name,
            status: 'Successfully uploaded',
            fileId: newFile.id
        };
    } catch (error) {
        return {
            fileName: file.name,
            status: 'File could not be uploaded',
            error: error
        };
    }
}
