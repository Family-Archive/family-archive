import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import permissionLib from '@/lib/permissions/lib'

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

    if (! await permissionLib.checkPermissions(session.user.id, 'Collection', params.id)) {
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

    if (! await permissionLib.checkPermissions(session.user.id, 'Collection', params.id)) {
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
        // TODO: Write a function for checking validity to prevent self-references or other loops and verify here

        if (!(await validateParent(params.id, formData['parentId']))) {
            return Response.json({
                status: "error",
                message: "Invalid parent relation"
            }, {
                status: 400
            })
        }

        if (formData['parentId'] === "null") {
            data = { parent: { disconnect: true } }
        } else {
            data = { parentId: formData['parentId'] }
        }
    }

    if (Object.keys(formData).includes('name')) {
        if (!formData['name']) {
            return Response.json({
                'status': 'error',
                'message': 'Name cannot be empty'
            }, {
                status: 400
            })
        }

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

    if (! await permissionLib.checkPermissions(session.user.id, 'Collection', params.id)) {
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

/**
 * Given a collection ID and prospective parent ID, ensure that the relation makes sense
 * Returns false if trying to make a collection a child of itself or a child of a nested collection
 * @param {string} collectionId: The ID of the collection we are modifying
 * @param {string} parentId: The ID of the parent to which this collection will be a child
 * @returns {boolean}: If the modification is valid or not
 */
const validateParent = async (collectionId, parentId) => {
    // If the IDs are the same, return false
    if (collectionId == parentId) {
        return false
    }

    let currParent = await prisma.Collection.findUnique({
        where: { id: parentId },
        select: { parentId: true }
    })
    currParent = currParent?.parentId

    // Otherwise, look at the parent ID and keep iterating recursively up through its parents, checking each to see if the ID matches the current
    // If so, the new parent ID is already a child so return false
    while (currParent) {
        if (currParent == collectionId) {
            return false
        }

        currParent = await prisma.Collection.findUnique({
            where: { id: currParent },
            select: { parentId: true }
        })
        currParent = currParent.parentId
    }

    return true
}