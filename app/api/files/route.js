import { NextResponse } from 'next/server'
import LocalFileSystem from '@/lib/FileStorage/LocalFileSystem'

export async function POST(request) {
    const formData = await request.formData();

    const fileSystem = new LocalFileSystem();

    formData.getAll('file').forEach(async (file) => {
        await fileSystem.store(file);
    });

    return NextResponse.json({
        message: 'File(s) stored successfully',
    });
}
