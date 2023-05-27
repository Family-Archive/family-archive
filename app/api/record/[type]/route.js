import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

// This is just a quick idea of the kind of dynamic loading we can do
// Different record types are defined in api/record/[type]/(types)
// When a specific record is queried at, ie, api/record/recipe (note the dynamic route),
// it hits this page which dynamically includes the matching file from the (types) directory
// said file must implement the API by including the required functions and stuff

export async function GET(request, { params }) {
    const recordTypeFunctions = require(`./(types)/${params.type}.js`)
    return recordTypeFunctions.GET()
}

export async function POST(request, { params }) {
    // Session is included here and passed, because NextAuth can't get the session in the dynamic file

    const session = await getServerSession(authOptions);
    const recordTypeFunctions = require(`./(types)/${params.type}.js`)
    const res = await recordTypeFunctions.POST(request, { params }, session)

    redirect('/')
}
