import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';
import { NextResponse } from 'next/server'

// Fetch all pronouns
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    let where = lib.limitQueryByFamily({}, request.cookies, session)
    const pronounSets = await prisma.PronounSet.findMany({
        where: where
    })

    return NextResponse.json({
        status: 'success',
        data: {
            pronounSets: pronounSets
        }
    }, {
        status: 200
    })
}