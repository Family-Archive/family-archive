import { prisma } from "../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from "../../../lib/lib"

export async function GET(request) {
    const session = await getServerSession(authOptions);
    const params = request.nextUrl.searchParams

    // Pull out sort and direction params and set those explicitly
    const sortField = params.get('sort') ? params.get('sort') : 'name'
    const direction = params.get('dir') ? params.get('dir') : 'asc'

    const page = params.get('page') ? params.get('page') : '1'
    const take = page * 20
    const skip = take - 20

    // Build a WHERE object from the filters passed
    // Note how separate filters are conjoined, but different values of the same filter are disjoined
    let where = {}
    if (params.get('filters')) {
        where = { AND: [] }
        const filterObject = JSON.parse(params.get('filters'))
        for (let filter of Object.keys(filterObject)) {
            let orBlock = []
            for (let value of filterObject[filter]) {
                orBlock.push({ [filter]: { contains: value } })
            }
            where.AND.push({ OR: orBlock })
        }
    }

    where = lib.limitQueryByFamily(where, session)

    const result = await prisma.Record.findMany({
        skip: skip,
        take: take,
        orderBy: {
            [sortField]: direction
        },
        where: where
    })

    return Response.json(result)
}