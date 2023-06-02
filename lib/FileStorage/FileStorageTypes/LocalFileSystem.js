import FileStorageInterface from '../FileStorageInterface'
import * as fs from 'node:fs';
import File from '../File'
import { prisma } from '@/app/db/prisma'

export default class LocalFileSystem extends FileStorageInterface {
    constructor() {
        super();
    }

    async getPath(fileId) {
        const fileRow = await prisma.file.findUnique({
            where: {
                id: fileId
            }
        });

        const file = File.load(fileRow);

        return file.getPath();
    }

    async store(uploadedFile) {
        const file = await File.create(uploadedFile);
        const arrayBuffer = await file.getArrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Check if the file already exists at this path.
        if (!fs.existsSync(file.getPath())) {
            await this.ensurePathDirectoriesExist(file.path);

            // Write the file.
            await fs.promises.writeFile(file.getPath(), buffer);
        }

        // Add a row for the file in the database.
        const newFile = await prisma.file.create({
            data: {
                hash: file.hash,
                name: file.name,
                mimeType: file.type,
                size: file.size
            }
        });
        newFile.path = File.load(newFile).getPath();

        return newFile;
    }

    /**
     * Check if the directories for a file path already exist.
     * If they don't, make them.
     * 
     * @param {FilePath} filePath 
     */
    async ensurePathDirectoriesExist(filePath) {
        let path = `${process.env.FILESTORAGE_PATH}/${filePath.firstDirectory}/${filePath.secondDirectory}`;
        try {
            await fs.promises.mkdir(path, {
                recursive: true
            });
        } catch (error) {
            console.log(error);
        }
    }
}