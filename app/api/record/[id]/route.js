import { prisma } from "../../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '../../../../lib/lib'
import FileStorageFactory from '@/lib/FileStorage/FileStorageFactory'

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    let where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const recordData = await prisma.record.findFirst({
        where: where
    })

    const RecordType = require(`/recordtypes/${recordData.type}/record.js`)
    const recordType = new RecordType()
    const recordConfig = recordType.getRecordTypeConfig()
    const icon = recordType.getRecordTypeIcon()

    const files = await prisma.file.findMany({
        where: {
            recordId: params.id
        }
    })

    const extraFields = await prisma.RecordField.findMany({
        where: {
            recordId: params.id
        }
    })

    return Response.json({ status: "success", data: { icon: icon, recordType: recordConfig, record: recordData, files: files, fields: extraFields } })
}

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const oldRecordWithFiles = await prisma.record.findFirst({
        where: {
            id: params.id
        },
        include: {
            files: true
        }
    })
    const oldRecordFileIds = oldRecordWithFiles.files.map(file => file.id)

    // List of file ids that are currently connected to the record.
    let connectedFiles = []

    let formData = await request.formData()

    // Get files separately from other fields because there can be
    // multiple entries for the "files" key.
    const files = formData.getAll('files')

    // Any files that were submitted without an id need to first
    // be stored and attached to the record.
    for (const file of files) {
        // The file's value will either be a file object or a string
        // containing the file's id.
        if (file instanceof File) {
            // Store the file and connect it to the record.
            const fileSystem = FileStorageFactory.instance()
            const newFile = await fileSystem.store(file, params.id)

            // Add the new file id to the list of connected files.
            connectedFiles.push(newFile.id)
        } else if (typeof file === 'string') {
            // Add the file id to the list of connected files.
            connectedFiles.push(file)
        }
    }

    // Find any files that were previously connected but are not any more.
    const fileIdsToDelete = oldRecordFileIds.filter(fileId => !connectedFiles.includes(fileId))

    // Delete file rows that should no longer be connected to the record.
    if (fileIdsToDelete.length > 0) {
        await prisma.file.deleteMany({
            where: {
                id: {
                    in: fileIdsToDelete
                }
            }
        })
    }

    // We're done processing files, so get rid of them and let us focus
    // on the simple field values.
    formData.delete('files')

    // Store updated data for the record's default fields.
    let defaultFieldData = {}

    // List of all custom record fields for this record. This will get
    // initialized if/when necessary.
    let recordFields = null

    for (const [key, value] of formData.entries()) {
        const defaultRecordTypeFields = ['name', 'description']
        if (defaultRecordTypeFields.includes(key)) {
            defaultFieldData[key] = value
        }

        // For custom fields, we need to update the related table's field.
        else {
            // Get all related fields for the record if we haven't done so already.
            if (recordFields === null) {
                recordFields = await prisma.RecordField.findMany({
                    where: {
                        record: {
                            id: params.id
                        }
                    }
                })
            }

            // Compare the stored value for this field with the submitted one.
            const recordField = recordFields.find(field => field.name === key)

            // If the value has been updated, persist that update in the database.
            if (recordField && recordField.value !== value) {
                await prisma.recordField.update({
                    where: {
                        id: recordField.id
                    },
                    data: {
                        value: value
                    }
                })
            }
        }
    }

    // Convert the connectedFiles list into a format Prisma expects
    // for a "set" list.
    connectedFiles = connectedFiles.map(fileId => {
        return { id: fileId }
    })

    // Update the files and default fields on the record.
    try {
        await prisma.record.update({
            where: {
                id: params.id
            },
            data: {
                files: {
                    set: connectedFiles
                },
                ...defaultFieldData
            }
        })
    } catch (error) {
        console.log(error)
        return Response.json({ status: "error", message: "Could not update this record." })
    }

    // Update the record's completed state (all necessary fields are filled out) before returning
    const record = await lib.updateRecordCompletion(params.id)
    return Response.json({ status: "success", data: { record: record } })
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    let where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const record = await prisma.record.deleteMany({
        where: where
    })

    return Response.json({ status: "success", data: { message: "Record deleted" } })
}
