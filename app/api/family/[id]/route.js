import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// Update a family (change name)
export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    let formData = await request.formData()
    if (!formData.get('name')) {
        return Response.json({
            status: 'error',
            message: "A name is required"
        }, {
            status: 400
        })
    }

    const family = await prisma.Family.update({
        data: {
            name: formData.get('name'),
        },
        where: {
            id: params.id
        }
    })

    return Response.json({ status: "success", data: { family: family } })
}

// Delete a family 😬
export async function DELETE(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const family = await prisma.Family.delete({
        where: {
            id: params.id
        }
    })

    return Response.json({ status: "success", data: { message: "Family deleted" } })
}