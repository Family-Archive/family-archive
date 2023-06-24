import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

export async function POST(request) {
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

    return Response.json(prismaRequest)
}