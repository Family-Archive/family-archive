import { prisma } from "../../db/prisma"

export async function GET(request) {
    const params = request.nextUrl.searchParams

    // Pull out sort and direction params and set those explicitly
    const sortField = params.get('sort') ? params.get('sort') : 'name'
    const direction = params.get('dir') ? params.get('dir') : 'asc'

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

    const result = await prisma.Record.findMany({
        skip: 0,
        take: 20,
        orderBy: {
            [sortField]: direction
        },
        where: where
    })

    return Response.json(result)
}