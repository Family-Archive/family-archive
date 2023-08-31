import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';

export async function POST(request) {
    const headersList = headers()
    const referer = headersList.get('referer')

    const session = await getServerSession(authOptions);
    let requestData = await request.formData()
    requestData = Object.fromEntries(requestData)

    const prismaRequest = await prisma.family.create({
        data: {
            name: requestData.name,
            users: {
                connect: [
                    { id: session.user.id }
                ]
            }
        }
    })

    // TODO: add error handling here

    return Response.redirect(new URL(referer))
}