import { cookies } from 'next/dist/client/components/headers'
import clientLib from '../../../../lib/client/lib'
import lib from '../../../../lib//lib'
import Link from 'next/link'

import styles from './ViewRecord.module.scss'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import FileViewer from '@/components/FileViewer/FileViewer'
import DeleteRecordButton from './DeleteRecordButton'
import Dropdown from '@/components/Dropdown/Dropdown'
import MoveToCollectionButton from './MoveToCollectionButton'
import RemoveFromCollectionButton from './RemoveFromCollection'

const fetchRecord = async (params) => {
    const record = await fetch(`${process.env.NEXTAUTH_URL}/api/record/${params.id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    return await record.json()
}

const fetchCollections = async (params) => {
    const record = await fetch(`${process.env.NEXTAUTH_URL}/api/collection?recordId=${params.id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    return await record.json()
}

const ViewRecord = async ({ params }) => {
    const fetchFieldRenderFunction = (name) => {
        for (let field of recordType.fields) {
            if (field.name === name) {
                const renderFunction = require(`/components/Form/FieldComponents/${field.type}/render.js`)
                return renderFunction
            }
        }
        return false
    }

    const recordData = await fetchRecord(params);
    const record = recordData.data.record
    const RecordType = require(`/recordtypes/${record.type}/record.js`)
    const recordType = new RecordType()
    const recordIcon = clientLib.renderIconFromData(recordData.data.icon)

    const collectionsData = await fetchCollections(params)
    const collections = collectionsData.data.collections

    return (
        <div className={styles.ViewRecord}>
            <div className="topBar">
                <h1 className='title'>{record.name}</h1>
                <div className='pageOptions'>
                    <Link href={`/record/${params.id}/edit`}>
                        <button><span className="material-icons">edit</span>Edit record</button>
                    </Link>
                    <Dropdown
                        title="Options"
                        options={[
                            <MoveToCollectionButton id={record.id} />,
                            collections.length > 0 ? <RemoveFromCollectionButton id={record.id} /> : "",
                            <DeleteRecordButton id={record.id} />
                        ]}
                    />
                </div>
            </div>

            <div className={styles.infoBar}>
                <span className={styles.type}>{recordIcon}{record.type}</span>
                <BreadcrumbTrail name={record.name} />
            </div>

            <div className={styles.mainContent}>

                <div className={styles.content}>
                    <div className={styles.file}>
                        {recordData.data.files.length > 0 ? <FileViewer files={recordData.data.files} /> : ""}
                    </div>
                    <div className={styles.info}>
                        <strong>Description</strong>
                        <p>{record.description}</p>

                        {recordData.data.fields.map(field => {
                            if (field.value) {
                                const renderFunction = fetchFieldRenderFunction(field.name)
                                if (renderFunction) {
                                    return renderFunction.render(field.value)
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
                                return <a id={collection.id} href={`/collection/${collection.id}`}>{collection.name}, </a>
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

export default ViewRecord