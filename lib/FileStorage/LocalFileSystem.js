import FileStorageInterface from './FileStorageInterface'
import * as fs from 'node:fs';
import File from './File'
import { prisma } from '@/app/db/prisma'

export default class LocalFileSystem extends FileStorageInterface {
    constructor() {
        super();
    }

    async store(uploadedFile) {
        const file = await File.create(uploadedFile);
        const arrayBuffer = await file.getArrayBuffer();
        const buffer = Buffer.from(arrayBuffer);


        // Check if the file already exists at this path.
        if (fs.existsSync(file.getPath())) {
            console.log('File already exists in file system.');
            return;
        }

        await this.ensurePathDirectoriesExist(file.path);

        // Write the file.
        const writePromise = await fs.promises.writeFile(file.getPath(), buffer);
        return writePromise;
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