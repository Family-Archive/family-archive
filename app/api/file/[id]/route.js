import fs from 'fs'
import { prisma } from "../../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import lib from '../../../../lib/lib'

export async function GET(request, { params }) {

    const searchParams = request.nextUrl.searchParams

    // TODO: Fix security; right now this just checks if you're logged in, but not whether you belong to a family that owns this image
    // Logged-in users can view any files if they have the ID
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({ 'status': 'error', 'message': "Invalid session" }, { status: 401 })
    }

    const fileRecord = await prisma.file.findFirst({
        where: { id: params.id }
    })
    const filePath = lib.getFilePath(fileRecord.hash)
    const file = await fs.readFileSync(filePath)

    return new Response(file, {
        headers: {
            "Content-Type": fileRecord.mimeType,
            "Content-Disposition": searchParams.get('download') === "true" ? `attachment; filename="${fileRecord.name}"` : "inline"
        }
    })
}