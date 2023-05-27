import { prisma } from "../../../../db/prisma"

// A record file defines a structure that's returned via a GET request and also how to update the database when POSTed to
// Obviously when there are multiple record types, they will all need to implement this basic type, which I haven't quite worked out yet

export async function GET() {
    return Response.json({
        'type': 'basic',
        'name': 'Basic Record',
        'fields': [
            {
                'name': 'Name',
                'type': 'text'
            },
            {
                'name': 'Description',
                'type': 'textarea'
            }
        ]
    })
}

export async function POST(request, { params }, session) {
    let requestData = await request.formData()
    requestData = Object.fromEntries(requestData)

    const record = await prisma.Record.create({
        data: {
            name: requestData.Name,
            description: requestData.Description,
            userCreatedId: session.user.id
        },
    })

    return record
}
