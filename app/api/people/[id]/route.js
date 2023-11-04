import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';
import { NextResponse } from 'next/server'
import FileStorageFactory from '@/lib/FileStorage/FileStorageFactory';

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

    const where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const person = await prisma.Person.findFirst({
        where: where
    })

    const pronouns = await prisma.PronounSet.findFirst({
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

    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const person = await prisma.Person.deleteMany({
        where: where
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

    let formData = await request.formData()

    let profileImage
    const files = formData.getAll('files')
    if (files[0] instanceof File) {
        // Store the file and connect it to the person.
        const fileSystem = FileStorageFactory.instance()
        const newFile = await fileSystem.store(files[0], params.id, 'person')

        // Add the new file id to the list of connected files.
        profileImage = newFile.id
    } else if (typeof files[0] === 'string') {
        // Add the file id to the list of connected files.
        profileImage = files[0]
    }

    // In order to disallow users from accessing records belonging to other families,
    // we limit queries like {where: AND [id: value, familyId: value]}
    // In order to use AND in an update query, we have to use updateMany even though we're only updating one record
    const where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const person = await prisma.Person.updateMany({
        data: {
            fullName: formData.get('fullName'),
            shortName: formData.get('shortName'),
            pronounsId: formData.get('pronouns'),
            born: formData.get('birthdate') ? new Date(formData.get('birthdate')) : null,
            died: formData.get('deathdate') ? new Date(formData.get('deathdate')) : null,
            profileImageId: profileImage
        },
        where: where
    })

    return Response.json({ status: "success", data: { person: person } })
}