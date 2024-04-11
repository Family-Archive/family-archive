import { cookies } from 'next/dist/client/components/headers'
import clientLib from '../../../../lib/client/lib'
import lib from '../../../../lib/lib'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import permissionLib from '@/lib/permissions/lib'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import dynamic from 'next/dynamic'

import styles from './ViewRecord.module.scss'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import FileViewer from '@/components/FileViewer/FileViewer'
import DeleteRecordButton from './DeleteRecordButton'
import Dropdown from '@/components/Dropdown/Dropdown'
import MoveToCollectionButton from './MoveToCollectionButton'
import RemoveFromCollectionButton from './RemoveFromCollection'
import EditPermissionsButton from './EditPermissionsButton'

/**
 * This page displays a record's information
 */

/**
 * Feth the data for a record
 * @param {Object} id: The ID of the record to fetch
 */
const fetchRecord = async (id) => {
    const record = await fetch(`${process.env.NEXTAUTH_URL}/api/record/${id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    return await record.json()
}

/**
 * Fetch the collections that this record belongs to
 * @param {string} id: The ID of the record
 */
const fetchCollections = async (id) => {
    const record = await fetch(`${process.env.NEXTAUTH_URL}/api/collection?recordId=${id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    return await record.json()
}

const ViewRecord = async ({ params }) => {

    /**
     * FieldComponents may include a render.js file that defines a custom method for rendering the field in a bespoke way.
     * This function allows us to fetch that render function for any given FieldComponent
     * @param {string} name: The name of the FieldComponent type
     * @returns {function|boolean}: If a function is found, return said function. Otherwise, return false
     */
    const fetchFieldRenderFunction = (name) => {
        for (let field of recordType.fields) {
            if (field.name === name) {
                const renderFunction = require(`/components/Form/FieldComponents/${field.type}/render.js`)
                return renderFunction
            }
        }
        return false
    }

    // Fetch Record data
    const recordData = await fetchRecord(params.id);
    if (!recordData.data) {
        redirect('/')
    }
    const record = recordData.data.record

    // Instantiate RecordType object, and get the icon from this
    const RecordType = require(`/recordtypes/${record.type}/record.js`)
    const recordType = new RecordType()
    const recordIcon = clientLib.renderIconFromData(recordData.data.icon)

    // Fetch collections this record belongs to
    const collectionsData = await fetchCollections(params.id)
    const collections = collectionsData.data.collections

    // Determine if this user can edit this record
    const session = await getServerSession(authOptions);
    const hasEditAccess = await permissionLib.checkPermissions(session.user.id, 'Record', params.id, 'edit')

    return (
        <div className={styles.ViewRecord}>
            <div className="topBar">
                <h1 className='title'>{record.name}</h1>
                {hasEditAccess ?
                    <div className='pageOptions'>
                        <Link href={`/record/${params.id}/edit`}>
                            <button><span className="material-icons">edit</span>Edit record</button>
                        </Link>
                        <Dropdown
                            title="Options"
                            options={[
                                <EditPermissionsButton id={record.id} />,
                                <MoveToCollectionButton id={record.id} />,
                                collections.length > 0 ? <RemoveFromCollectionButton id={record.id} /> : "",
                                <DeleteRecordButton id={record.id} />
                            ]}
                        />
                    </div>
                    : ""}
            </div>

            <div className={styles.infoBar}>
                <span className={styles.type}>{recordIcon}{record.type}</span>
                <BreadcrumbTrail name={record.name} />
            </div>

            <div className={styles.mainContent}>

                <div className={styles.content}>
                    <div className={styles.file}>
                        {recordData.data.files.length > 0 ? <FileViewer initialFiles={recordData.data.files} /> : ""}
                    </div>
                    <div className={styles.info}>
                        <strong>Description</strong>
                        <p>{record.description}</p>

                        {recordData.data.fields.map(field => {
                            // For each field attached to this record,
                            // check if the field has a value, and if so,
                            // attempt to fetch a custom render function
                            // If this exists, use it; otherwise, just print out the name and value of the field

                            // Note that the field value is always passed to render() - the function must expect the data as an argument
                            if (field.value) {
                                const renderFunction = fetchFieldRenderFunction(field.name)
                                if (renderFunction) {
                                    return <div key={field.id}>
                                        {renderFunction.render(field.value)}
                                    </div>
                                } else {
                                    return <div key={field.id}>
                                        <strong>{field.name}</strong>
                                        <p>{field.value}</p>
                                    </div>
                                }
                            }
                        })}
                    </div>
                </div>

                <div className={styles.otherInfo}>
                    <div>
                        <h2>Details</h2>
                        <strong>Created by</strong>
                        <p>{record.userCreatedId}</p>
                        <strong>Created at</strong>
                        <p>{record.createdAt}</p>
                        <strong>Last updated</strong>
                        <p>{record.updatedAt}</p>
                        <strong>Type</strong>
                        <p>{record.type}</p>
                        {collections.length > 0 ? <>
                            <strong>Collections</strong>
                            <p>{collections.map(collection => {
                                return <a id={collection.id} key={collection.id} href={`/collection/${collection.id}`}>{collection.name}, </a>
                            })}</p>
                        </> : ""}
                    </div>
                    <div>
                        <strong>Family ID</strong>
                        <p>{record.familyId}</p>
                    </div>
                </div>

            </div>
        </div>
    )
}

// We need to disable SSR for this page because of the dynamic field render functions
export default dynamic(() => Promise.resolve(ViewRecord), {
    ssr: false
})