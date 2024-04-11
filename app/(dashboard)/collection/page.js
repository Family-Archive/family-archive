import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib'
import Collections from '@/components/Collections/Collections'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import CreateCollectionButton from './CreateCollectionButton'

/**
 * This page displays all top-level collections
 */

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
            <div className='topBar' style={{ paddingRight: '1rem' }}>
                <h1 className='title'>All Collections</h1>
                <div className='pageOptions'>
                    <CreateCollectionButton />
                </div>
            </div>
            <BreadcrumbTrail /><br />
            <Collections collections={collections} />
        </>
    )
}

export default allCollections