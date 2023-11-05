import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib';

import AllRecords from '@/components/AllRecords/AllRecords'

/**
 * This page displays all draft files
 */

const draftView = async () => {
    let drafts = await fetch(`${process.env.NEXTAUTH_URL}/api/drafts`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    drafts = await drafts.json()
    drafts = drafts.data.records

    return (
        <>
            <h1 className='title'>Draft Records</h1>
            <AllRecords records={drafts} />
        </>
    )
}

export default draftView