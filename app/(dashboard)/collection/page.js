import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib'
import Collections from '@/components/Collections/Collections'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'

const allCollections = async ({ searchParams }) => {
    let collections = await fetch(`${process.env.NEXTAUTH_URL}/api/collection`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    collections = await collections.json()
    collections = collections.data.collections

    return (
        <>
            <h1 className='title'>All Collections</h1>
            <BreadcrumbTrail /><br />
            <Collections collections={collections} />
        </>
    )
}

export default allCollections