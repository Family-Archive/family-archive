import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
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
        }
    })

    const pronouns = await prisma.PronounSet.findUnique({
        where: {
            id: person.pronounsId
        }
    })
    person.pronouns = pronouns

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
    // If an ID in the field doesn't match anybody in the site, we just display "Deleted user" and can remove said missing user manually

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

    const currFamily = request.cookies.get('familyId').value
    let formData = await request.formData()

    let profileImage
    const files = formData.getAll('files')
    if (typeof files[0] === 'object') {
        // Store the file and connect it to the person.
        const fileSystem = FileStorageFactory.instance()
        const newFile = await fileSystem.store(files[0], currFamily, params.id, 'person')

        // Add the new file id to the list of connected files.
        profileImage = newFile.id
    } else if (typeof files[0] === 'string') {
        // Add the file id to the list of connected files.
        profileImage = files[0]
    }

    if (!formData.get('fullName')) {
        return NextResponse.json({
            status: 'error',
            message: "Full name is a required field"
        }, {
            status: 400
        })
    }

    if (!formData.get('pronouns')) {
        return NextResponse.json({
            status: 'error',
            message: "Pronouns is a required field"
        }, {
            status: 400
        })
    }

    const person = await prisma.Person.update({
        data: {
            fullName: formData.get('fullName'),
            shortName: formData.get('shortName') || "",
            pronounsId: formData.get('pronouns'),
            born: formData.get('birthdate') ? new Date(formData.get('birthdate')) : null,
            died: formData.get('deathdate') ? new Date(formData.get('deathdate')) : null,
            profileImageId: profileImage
        },
        where: {
            id: params.id
        }
    })

    return Response.json({ status: "success", data: { person: person } })
}