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
        })

        const file = File.load(fileRow)
        console.log('File loaded:')
        console.log(file)

        return file.getPath()
    }

    async store(uploadedFile, resourceId = null, type = 'record') {
        const file = await File.create(uploadedFile)
        const arrayBuffer = await file.getArrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // Check if the file already exists at this path.
        if (!fs.existsSync(file.getPath())) {
            await this.ensurePathDirectoriesExist(file.path)

            // Write the file.
            await fs.promises.writeFile(file.getPath(), buffer)
        }

        let prismaData = {
            data: {
                hash: file.hash,
                name: file.name,
                mimeType: file.type,
                size: file.size
            }
        }

        if (resourceId) {
            if (type == 'person') {
                prismaData.data.Person = {
                    connect: {
                        id: resourceId
                    }
                }
            } else {
                prismaData.data.record = {
                    connect: {
                        id: resourceId
                    }
                }
            }
        }

        // Add a row for the file in the database.
        const newFile = await prisma.file.create(prismaData)
        newFile.path = File.load(newFile).getPath()

        return newFile
    }

    /**
     * Load a file from the disk into memory and return it as
     * a buffer object that can be sent in an HTTP response.
     * 
     * @param {string} fileId 
     * @return Buffer object containing file
     */
    async loadFile(fileId) {
        try {
            const fileBuffer = fs.readFileSync(await this.getPath(fileId))
            return fileBuffer
        } catch (error) {
            console.log(error)
            return null
        }
    }

    /**
     * Check if the directories for a file path already exist.
     * If they don't, make them.
     * 
     * @param {FilePath} filePath 
     */
    async ensurePathDirectoriesExist(filePath) {
        let path = `${process.env.FILESTORAGE_PATH}/${filePath.firstDirectory}/${filePath.secondDirectory}`
        try {
            await fs.promises.mkdir(path, {
                recursive: true
            })
        } catch (error) {
            console.log(error)
        }
    }
}