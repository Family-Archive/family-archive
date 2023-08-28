import { prisma } from "../../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from '../../../../lib/lib'

export async function GET(request, { params }) {

    const session = await getServerSession(authOptions);

    let where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const record = await prisma.record.findFirst({
        where: where
    })

    const files = await prisma.file.findMany({
        where: {
            recordId: params.id
        }
    })

    const extraFields = await prisma.RecordField.findMany({
        where: {
            recordId: params.id
        }
    })

    return Response.json({ status: "success", data: { record: record, files: files, fields: extraFields } })
}

export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions)

    let data = await request.formData()
    data = Object.fromEntries(data)

    const record = await prisma.record.update({
        where: { id: params.id },
        data: data
    })

    return Response.json({ status: "success", data: { record: record } })
}

export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);

    let where = lib.limitQueryByFamily({ id: params.id }, request.cookies, session)
    const record = await prisma.record.deleteMany({
        where: where
    })

    return Response.json({ status: "success", data: { message: "Record deleted" } })
}