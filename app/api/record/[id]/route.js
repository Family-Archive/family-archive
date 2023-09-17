import { prisma } from "../../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '../../../../lib/lib'

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

    let formData = await request.formData()
    formData = Object.fromEntries(formData)

    // Parse the form data and turn it into a Prisma update where the key is the column and the value is the new value

    let data = {}
    for (let key of Object.keys(formData)) {
        // First, try parsing the value as JSON. If that doesn't work, we assume this is just a standard key->value pair as described above
        // If it IS JSON, this is more complex -- probably a relation that we have to handle
        try {
            const keyJSON = JSON.parse(formData[key])
            if (keyJSON["connect"]) {
                // If there's a value "connect" set to true, then use the "name" and "value" props to create this relation
                data[keyJSON["name"]] = { connect: { id: keyJSON["value"] } }
            } else if (keyJSON["disconnect"]) {
                // If there's a value "disconnect" set to true, first get all the existing relations for this
                const currConnections = await prisma.record.findUnique({
                    where: { id: params.id },
                    select: { [keyJSON["name"]]: true }
                })
                // and filter out the one that matches the value that we've passed
                const newConnections = []
                for (let connection of currConnections[keyJSON["name"]]) {
                    if (connection.id !== keyJSON["value"]) {
                        newConnections.push({ id: connection.id })
                    }
                }
                // Finally, set the relation array to the new value
                data[keyJSON["name"]] = { set: newConnections }
            }
        } catch {
            data[key] = formData[key]
        }
    }

    let record = await prisma.record.update({
        where: { id: params.id },
        data: data
    })

    // Update the record's completed state (all necessary fields are filled out) before returning
    record = await lib.updateRecordCompletion(params.id)
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
