import { prisma } from "../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from "../../../lib/lib"

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

    let where = lib.limitQueryByFamily({ completed: false }, request.cookies, session)
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