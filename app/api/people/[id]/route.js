import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';
import * as peopleLib from '@/app/(dashboard)/people/[id]/lib'
import permissionLib from '@/lib/permissions/lib'
import { NextResponse } from 'next/server'
import FileStorageFactory from '@/lib/classes/FileStorage/FileStorageFactory';

// Fetch a person's information
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

    if (! await permissionLib.checkPermissions(session.user.id, 'Person', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const person = await prisma.Person.findUnique({
        where: {
            id: params.id
        },
        include: {
            parents: true,
            children: true,
            indirectRelationships: {
                include: {
                    relationshipType: true,
                    people: true,
                }
            }
        },
    })

    return NextResponse.json({
        status: 'success',
        data: {
            person: person
        }
    }, {
        status: 200
    })
}

export async function DELETE(request, { params }) {
    // !!!!!!!!!!!!!!!!! IMPORTANT !!!!!!!!!!!!!!!!!!!!!
    // TODO: THIS JUST DELTES THE PERSON FROM THE DB!
    // We'll need to decide what to do with records connected to people,
    // ESPECIALLY because the connection is stored in JSON in the RecordField table, not via an actual relation
    // What do we do if a record is connected to a nonexistant user? Should we clear that out here?

    // For now, we just handle nonexistant person IDs in the PersonSelector component itself.
    // If an ID in the field doesn't match anybody in the site, we just display "User unavailable" and can remove said missing user manually

    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    if (! await permissionLib.checkPermissions(session.user.id, 'Person', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    const person = await prisma.Person.delete({
        where: {
            id: params.id
        }
    })

    return NextResponse.json({
        status: 'success',
        data: {
            message: "Person deleted successfully"
        }
    }, {
        status: 200
    })
}

// Update a person
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

    if (! await permissionLib.checkPermissions(session.user.id, 'Person', params.id)) {
        return Response.json({
            status: "error",
            message: "User does not have permission to access this resource"
        }, {
            status: 403
        })
    }

    // Get the existing person so we can compare relationships
    // to figure out what needs to be updated.
    const existingPerson = await prisma.Person.findUnique({
        where: {
            id: params.id
        },
        include: {
            parents: true,
            children: true,
            indirectRelationships: {
                include: {
                    relationshipType: true,
                    people: true,
                }
            }
        },
    })

    const currFamily = request.cookies.get('familyId').value
    let formData = await request.formData()

    let profileImage
    let files = formData.getAll('files')
    files = files ? files : []
    if (files[0] instanceof File) {
        // Store the file and connect it to the person.
        const fileSystem = FileStorageFactory.instance()
        const newFile = await fileSystem.store(files[0], currFamily, params.id, 'person')

        // Add the new file id to the list of connected files.
        profileImage = newFile.id
    } else if (typeof files[0] === 'string') {
        // Add the file id to the list of connected files.
        profileImage = files[0]
    }

    const [connectImage, disconnectImage] = lib.compareRelatedRecords([existingPerson.profileImageId], [profileImage])

    let profileImageQuery = {}
    if (connectImage.length > 0) {
        profileImageQuery.connect = connectImage[0]
    }
    if (disconnectImage.length > 0) {
        profileImageQuery.disconnect = disconnectImage[0]
    }

    // Process user relationships.
    let parents = JSON.parse(formData.get('parents'))
    let children = JSON.parse(formData.get('children'))
    let spouse = JSON.parse(formData.get('spouse'))

    const [connectParents, disconnectParents] = lib.compareRelatedRecords(existingPerson.parents.map(p => p.id), parents)
    const [connectChildren, disconnectChildren] = lib.compareRelatedRecords(existingPerson.children.map(p => p.id), children)
    const [connectSpouse, disconnectSpouse] = lib.compareRelatedRecords([peopleLib.findSpouseId(existingPerson)], spouse)

    let data = {
        fullName: formData.get('fullName'),
        shortName: formData.get('shortName'),
        born: formData.get('birthdate') ? new Date(formData.get('birthdate')) : null,
        died: formData.get('deathdate') ? new Date(formData.get('deathdate')) : null,
        parents: {
            connect: connectParents,
            disconnect: disconnectParents,
        },
        children: {
            connect: connectChildren,
            disconnect: disconnectChildren,
        },
    }

    if (profileImageQuery.connect || profileImageQuery.disconnect) {
        data.profileImage = profileImageQuery
    }

    if (!formData.get('fullName')) {
        return NextResponse.json({
            status: 'error',
            message: "Full name is a required field"
        }, {
            status: 400
        })
    }

    const person = await prisma.Person.update({
        data: data,
        where: {
            id: params.id
        }
    })

    return Response.json({ status: "success", data: { person: person } })
}
