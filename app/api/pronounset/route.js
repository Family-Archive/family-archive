import { prisma } from '@/app/db/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
    const pronounSets = await prisma.PronounSet.findMany()
    return NextResponse.json({
        status: 'success',
        data: {
            pronounSets: pronounSets
        }
    }, {
        status: 200
    })
}