import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { revalidateTag } from 'next/cache'

// This is just a quick idea of the kind of dynamic loading we can do
// Different record types are defined in /lib/classes/record/types
// When a specific record is queried at, ie, api/record/recipe (note the dynamic route),
// it hits this page which dynamically includes the matching file from the types directory

export async function GET(request, { params }) {
    const RecordType = require(`/lib/classes/record/types/${params.type}.js`)
    const recordType = new RecordType()
    return Response.json(recordType.getStructure())
}

export async function POST(request, { params }) {
    // Session is included here and passed, because NextAuth can't get the session in the dynamic file
    const tag = request.nextUrl.searchParams.get('records')
    revalidateTag(tag)

    const session = await getServerSession(authOptions);
    const RecordType = require(`/lib/classes/record/types/${params.type}.js`)
    const recordType = new RecordType()

    let newRecord

    try {
        newRecord = await recordType.insert(request, { params }, session)
    } catch (error) {
        return Response.json({
            'status': 'error',
            'message': error.message
        }, {
            status: 500
        })
    }

    return Response.json({
        'status': 'success',
        data: {
            record: newRecord
        }
    }, {
        status: 201
    })
}
