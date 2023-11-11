import lib from '@/lib/lib'
import { cookies } from 'next/dist/client/components/headers'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import Collections from '../../../../components/Collections/Collections'
import AllRecords from '@/components/AllRecords/AllRecords'
import Dropdown from '@/components/Dropdown/Dropdown'
import MoveToCollectionButton from './MoveToCollectionButton'
import DeleteButton from './DeleteCollectionButton'
import RenameButton from './RenameButton'

/**
 * This page displays the children of a given collection
 */

const collection = async ({ params, searchParams }) => {
    // Fetch the child data of this collection
    let data = await fetch(`${process.env.NEXTAUTH_URL}/api/collection/${params.id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    data = await data.json()

    const thisCollection = data.data.collection
    const children = thisCollection.children || []
    const records = data.data.records

    return (
        <>
            <div className='topBar' style={{ paddingRight: '1rem' }}>
                <h1 className='title'>{thisCollection.name}</h1>
                <Dropdown
                    title="Options"
                    options={[
                        <RenameButton id={params.id} />,
                        <MoveToCollectionButton id={params.id} />,
                        <DeleteButton id={params.id} />,
                    ]}
                />
            </div>
            <BreadcrumbTrail /><br />
            <Collections collections={children} />
            {children.length > 0 && records.length > 0 ? <><br /><br /></> : ""}
            {records.length > 0 ? <AllRecords params={searchParams} records={records} showOptions={false} /> : ""}
        </>
    )
}

export default collection