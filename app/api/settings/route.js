import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server'
import lib from '@/lib/lib';

// Update DB settings
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    const data = await request.formData()
    for (let setting of data) {
        lib.setSetting(setting[0], setting[1])
    }

    return NextResponse.json({
        status: 'success',
        data: {
            message: "Settings updated successfully"
        }
    }, {
        status: 201
    });
}