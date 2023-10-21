import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';

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
    const collections = await prisma.collection.findMany({
        where: where
    })

    where = lib.limitQueryByFamily({ parentId: params.id }, request.cookies, session)
    const childCollections = await prisma.collection.findMany({
        where: where
    })

    where = lib.limitQueryByFamily({ collections: { some: { id: params.id } } }, request.cookies, session)
    const records = await prisma.record.findMany({
        include: {
            RecordField: true
        },
        where: where
    })

    // Reformat records with important recordFields on the top level for easy access
    for (let record of records) {
        if (record.RecordField) {
            for (const recordField of record.RecordField) {
                if (['date', 'person'].includes(recordField.name)) {
                    try {
                        record[recordField.name] = JSON.parse(recordField.value)
                    } catch { /* probably null or something, just don't include it */ }
                }
            }
        }
    }

    collections[0]['children'] = childCollections
    return Response.json({ status: "success", data: { collections: collections, records: records } })
}

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions)

    let formData = await request.formData()
    formData = Object.fromEntries(formData)

    let data = {}
    if (Object.keys(formData).includes('parentId')) {
        if (formData['parentId'] === "null") {
            data = { parent: { disconnect: true } }
        } else {
            data = { parentId: formData['parentId'] }
        }
    }

    if (Object.keys(formData).includes('name')) {
        data = { name: formData['name'] }
    }

    let record = await prisma.collection.update({
        where: { id: params.id },
        data: data
    })

    // Update the record's completed state (all necessary fields are filled out) before returning
    return Response.json({ status: "success", data: { record: record } })
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);

    let where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const collection = await prisma.collection.deleteMany({
        where: where
    })

    return Response.json({ status: "success", data: { message: "Collection deleted" } })
}