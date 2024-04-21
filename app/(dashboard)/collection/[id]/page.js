import lib from '@/lib/lib'
import permissionLib from '@/lib/permissions/lib'

import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'
import { cookies } from 'next/dist/client/components/headers'
import { redirect } from 'next/navigation'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import Collections from '../../../../components/Collections/Collections'
import Dropdown from '@/components/Dropdown/Dropdown'
import MoveToCollectionButton from './MoveToCollectionButton'
import DeleteButton from './DeleteCollectionButton'
import RenameButton from './RenameButton'
import EditPermissionsButton from './EditPermissionsButton'
import CreateCollectionButton from '../CreateCollectionButton'
import dynamic from 'next/dynamic'

/**
 * This page displays the children of a given collection
 */

const collection = async ({ params, searchParams }) => {
    const AllRecords = dynamic(() => import("@/components/AllRecords/AllRecords"), {
        ssr: false,
    })

    // Fetch the child data of this collection
    let data = await fetch(`${process.env.NEXTAUTH_URL}/api/collection/${params.id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    data = await data.json()

    if (!data.data) {
        redirect('/')
    }

    const thisCollection = data.data.collection
    const children = thisCollection.children || []
    const records = data.data.records

    // Determine if this user can edit this collection
    const session = await getServerSession(authOptions);
    const hasEditAccess = await permissionLib.checkPermissions(session.user.id, 'Collection', params.id, 'edit')

    return (
        <>
            <div className='topBar' style={{ paddingRight: '1rem' }}>
                <h1 className='title'>{thisCollection.name}</h1>
                {hasEditAccess ?
                    <div className='pageOptions'>
                        <Dropdown
                            title="Options"
                            options={[
                                <EditPermissionsButton id={params.id} />,
                                <RenameButton id={params.id} />,
                                <MoveToCollectionButton id={params.id} />,
                                <DeleteButton id={params.id} />,
                            ]}
                        />
                        <CreateCollectionButton />
                    </div> : ""
                }
            </div>
            <BreadcrumbTrail /><br />
            <Collections collections={children} />
            {children.length > 0 && records.length > 0 ? <><br /><br /></> : ""}
            {records.length > 0 ? <AllRecords params={searchParams} records={records} showOptions={false} /> : ""}
        </>
    )
}

export default collection