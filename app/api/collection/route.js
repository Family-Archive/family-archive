import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import lib from '@/lib/lib'

export async function GET(request) {
    // Get collections. If no ?name is passed, return collections at top of hierarchy (no parent)
    // If ?name is passed, return collections where name like '%{name}%'

    const session = await getServerSession(authOptions)
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const name = request.nextUrl.searchParams.get('name')
    const recordId = request.nextUrl.searchParams.get('recordId')

    let where
    if (name) {
        where = {
            name: {
                contains: name
            }
        }
    } else if (recordId) {
        where = {
            records: {
                some: {
                    id: recordId
                }
            }
        }
    } else {
        where = { parentId: null }
    }

    where = lib.limitQueryByFamily(where, request.cookies, session)
    const collections = await prisma.collection.findMany({
        where: where
    })

    return Response.json({ status: "success", data: { collections: collections } })
}

// Add a new collection
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    let requestData = await request.formData()
    requestData = Object.fromEntries(requestData)
    const currFamily = request.cookies.get('familyId').value

    if (!requestData.collectionName) {
        return Response.json({
            'status': 'error',
            'message': 'Collection name cannot be empty'
        }, {
            status: 400
        })
    }

    if (!currFamily) {
        return Response.json({
            'status': 'error',
            'message': 'Current family not specified'
        }, {
            status: 400
        })
    }

    let creationObj = {
        data: {
            name: requestData.collectionName,
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
    }
    if (requestData.collectionParentId) {
        creationObj['data']['parent'] = {
            connect: {
                id: requestData.collectionParentId
            }
        }
    }

    const collection = await prisma.collection.create(creationObj)

    return Response.json({ status: "success", data: { collection: collection } })
}