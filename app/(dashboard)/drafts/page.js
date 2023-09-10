import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { prisma } from "@/app/db/prisma"
import { cookies } from 'next/headers'
import lib from '@/lib/lib';

import AllRecords from '@/components/AllRecords/AllRecords'

const draftView = async ({ searchParams }) => {
    const session = await getServerSession(authOptions);

    let where = lib.limitQueryByFamily({ completed: false }, cookies(), session)
    const drafts = await prisma.record.findMany({
        where: where
    })

    return (
        <>
            <h1 className='title'>Draft Records</h1>
            <AllRecords records={drafts} />
        </>
    )
}

export default draftView