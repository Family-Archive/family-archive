import FileStorageFactory from '@/lib/FileStorage/FileStorageFactory'

const fs = require('node:fs')

class Record {

    name
    type
    fields
    config

    constructor(name, type, fields) {
        const baseFields = [
            {
                'name': 'Name',
                'type': 'text'
            },
            {
                'name': 'Description',
                'type': 'textarea'
            },
            {
                'name': 'Person',
                'type': 'PersonSelector'
            }
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

    async insert(request, { params }, session) {
        const formData = await request.formData()
        let requestData = Object.fromEntries(formData)

        const currFamily = request.cookies.get('familyId').value

        //Insert basic record object
        const record = await prisma.Record.create({
            data: {
                name: requestData.Name,
                description: requestData.Description,
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
            if (['Name', 'Description', 'file'].includes(field)) {
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

        const files = formData.getAll('file');

        for (const file of files) {
            try {
                const newFile = await fileSystem.store(file, recordId);
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
