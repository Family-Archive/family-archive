import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '@/lib/lib';

export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);

    let where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const collections = await prisma.collection.findMany({
        where: where
    })

    where = lib.limitQueryByFamily({ parentId: params.id }, request.cookies, session)
    const childCollections = await prisma.collection.findMany({
        where: where
    })

    where = lib.limitQueryByFamily({ collectionId: params.id }, request.cookies, session)
    const records = await prisma.record.findMany({
        where: where
    })

    collections[0]['children'] = childCollections
    return Response.json({ status: "success", data: { collections: collections, records: records } })
}