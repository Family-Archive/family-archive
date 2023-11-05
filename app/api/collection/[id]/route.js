import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';

// Fetch the information for a single collection
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

    if (! await lib.checkPermissions(session.user.id, 'Collection', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const collection = await prisma.collection.findUnique({
        where: {
            id: params.id
        }
    })

    const childCollections = await prisma.collection.findMany({
        where: {
            parentId: params.id
        }
    })

    const records = await prisma.record.findMany({
        include: {
            RecordField: true
        },
        where: {
            collections: {
                some: { id: params.id }
            }
        }
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

    collection['children'] = childCollections
    return Response.json({ status: "success", data: { collection: collection, records: records } })
}

// Update an existing collection
// Expects formData with name or parentId
export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    if (! await lib.checkPermissions(session.user.id, 'Collection', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

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

// Delete a collection (moves children to top level atm)
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

    if (! await lib.checkPermissions(session.user.id, 'Collection', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const collection = await prisma.collection.delete({
        where: {
            id: params.id
        }
    })

    return Response.json({ status: "success", data: { message: "Collection deleted" } })
}