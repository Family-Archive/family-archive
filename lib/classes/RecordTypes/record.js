import FileStorageFactory from '@/lib/classes/FileStorage/FileStorageFactory'
import { prisma } from '@/app/db/prisma'
import lib from '../../lib'

const fs = require('node:fs')

class Record {

    name
    type
    fields
    config
    familyId

    constructor(name, type, fields) {
        const baseFields = [
            {
                'label': 'Name',
                'name': 'name',
                'type': 'text',
                'required': true,
            },
            {
                'label': 'Description',
                'name': 'description',
                'type': 'textarea',
                'required': true,
            },
        ]

        this.name = name
        this.type = type
        this.fields = [].concat(baseFields, fields)
        this.config = this.getRecordTypeConfig()
    }

    getRecordTypeConfig() {
        const configFile = `${process.env.APPLICATION_ROOT}/recordtypes/${this.type}/config.json`
        let config
        try {
            config = fs.readFileSync(configFile, { encoding: 'utf8' })
        } catch (error) {
            throw new Error(`Could not find configuration file config.json for ${this.name} record type.`)
        }

        // Config files must be in valid JSON format. Throw an error if any are not.
        let parsedConfig
        try {
            parsedConfig = JSON.parse(config)
        } catch (error) {
            throw new Error(`Configuration file for ${this.name} record type is not valid JSON.`)
        }

        return parsedConfig
    }

    /**
     * Get the value of an option defined in this record type's
     * config.json file.
     * 
     * @param {string} name 
     * @returns option value; null if option wasn't found
     */
    getRecordTypeOption(name) {
        try {
            return this.config.options[name]
        } catch (error) {
            return null
        }
    }

    getStructure() {
        return {
            name: this.name,
            type: this.type,
            fields: this.fields,
            config: this.config
        }
    }

    getRecordTypeIcon() {
        const data = {}
        const iconFile = `${process.env.APPLICATION_ROOT}/recordtypes/${this.type}/icon.svg`

        if (fs.existsSync(iconFile)) {
            const contents = fs.readFileSync(iconFile, 'utf8')
            data['type'] = 'svg'
            data['content'] = contents
        } else {
            data['type'] = 'icon'
            const config = this.getRecordTypeConfig()
            if (config.icon) {
                data['content'] = config.icon
            } else {
                data['content'] = 'question_mark'
            }
        }

        return data
    }

    async insert(request, { params }, session) {
        const formData = await request.formData()
        let requestData = Object.fromEntries(formData)

        const currFamily = request.cookies.get('familyId').value
        this.familyId = currFamily

        // Insert basic record object
        let record = await prisma.Record.create({
            data: {
                name: requestData.name,
                description: requestData.description,
                type: params.type,
                userCreated: {
                    connect: {
                        id: session.user.id
                    }
                },
                family: {
                    connect: {
                        id: currFamily
                    }
                },
            }
        })

        // Iterate through requestData and insert custom fields into DB when applicable
        for (let field of Object.keys(requestData)) {
            if (['name', 'description', 'files'].includes(field)) {
                continue
            }

            const customField = await prisma.RecordField.create({
                data: {
                    name: field,
                    value: requestData[field],
                    record: {
                        connect: {
                            id: record.id
                        }
                    }
                },
            })
        }

        // Now store the files and attach them to the new record.
        const files = await this.storeFiles(formData, record.id)

        // Finally, check which fields were filled and update completion accordingly
        record = lib.updateRecordCompletion(record.id)
        return record
    }

    /**
     * Save all of the uploaded files in file storage and
     * get the stored file.
     * 
     * @param {FormData} formData 
     * @param {number} recordId New record to add files to
     * @returns Object with successfully saved files and
     * files that errored when saving
     */
    async storeFiles(formData, recordId) {
        const fileSystem = FileStorageFactory.instance()

        // Store records for files that were successfully uploaded.
        let newFiles = [];

        // Store error messages for files that failed to upload.
        let errorFiles = [];

        const files = formData.getAll('files');

        for (const file of files) {
            try {
                const newFile = await fileSystem.store(file, this.familyId, recordId);
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

        // Add the successfully uploaded filess to the record
        // in the database.
        const updatedRecord = await prisma.record.update({
            where: {
                id: recordId
            },
            data: {
                files: {
                    connect: this.getPrismaFileConnectClause(newFiles)
                }
            }
        })

        return {
            files: newFiles,
            errors: errorFiles
        }
    }

    /**
     * Get the array of objects used to connect records
     * together in Prisma's expected syntax.
     * 
     * @param {array} newFiles 
     * @return array
     */
    getPrismaFileConnectClause(newFiles) {
        return newFiles.map(file => {
            return {
                id: file.id
            }
        })
    }
}

export default Record
