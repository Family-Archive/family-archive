import { prisma } from "../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from "../../../lib/lib"

// Fetch all drafts from DB
export async function GET(request, { params }) {
    // TODO: Show all drafts to admins, show only owned drafts to everyone else

    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    let where = lib.limitQueryByFamily({ completed: false, userCreatedId: session.user.id }, request.cookies, session)
    const drafts = await prisma.record.findMany({
        where: where
    })

    return Response.json({
        status: 'success',
        data: {
            records: drafts
        }
    })
}