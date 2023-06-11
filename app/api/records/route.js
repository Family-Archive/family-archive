import { prisma } from "../../db/prisma"

export async function GET(request) {
    const params = request.nextUrl.searchParams
    const sortField = params.get('sort') ? params.get('sort') : 'name'
    const direction = params.get('dir') ? params.get('dir') : 'asc'

    const result = await prisma.Record.findMany({
        skip: 0,
        take: 20,
        orderBy: {
            [sortField]: direction
        }
    })

    return Response.json(result)
}