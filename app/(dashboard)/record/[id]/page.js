import { cookies } from 'next/dist/client/components/headers'
import lib from '../../../../lib/lib'
import { prisma } from "../../../db/prisma"

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
    const recordData = await fetchRecord(params);
    const record = recordData.data.record

    const collectionsData = await fetchCollections(params)
    const collections = collectionsData.data

    // Fetch people connected to record by reading the custom "Person" field
    let people = []
    for (let field of recordData.data.fields) {
        if (field.name === "Person" && field.value) {
            for (let id of JSON.parse(field.value)) {
                if (id) {
                    const person = await prisma.person.findFirst({
                        where: { id: id }
                    })
                    people.push(person)
                }
            }
        }
    }

    return (
        <div className={styles.ViewRecord}>
            <div className="topBar">
                <h1 className='title'>{record.name}</h1>
                <div className='pageOptions'>
                    <button><span className="material-icons">edit</span>Edit record</button>
                    <Dropdown
                        title="Options"
                        options={[
                            <MoveToCollectionButton id={record.id} />,
                            collections.collections.length > 0 ? <RemoveFromCollectionButton id={record.id} /> : "",
                            <DeleteRecordButton id={record.id} />
                        ]}
                    />
                </div>
            </div>

            <div className={styles.infoBar}>
                <span className={styles.type}>{record.type}</span>
                <BreadcrumbTrail name={record.name} />
            </div>

            <div className={styles.mainContent}>

                <div className={styles.content}>
                    <div className={styles.file}>
                        {/* <Image src={`/api/file/${recordData.data.files[0].id}`} width={500} height={500} /> */}
                        {recordData.data.files.length > 0 ? <FileViewer files={recordData.data.files} /> : ""}
                    </div>
                    <div className={styles.info}>
                        {people.length > 0 ?
                            <div className={styles.people}>
                                <span className={`${styles.icon} material-icons`}>boy</span>
                                {people.map(person => {
                                    return <button className={styles.person}>
                                        {person.fullName}
                                    </button>
                                })}
                            </div>
                            : ""}

                        <strong>Description</strong>
                        <p>{record.description}</p>

                        {recordData.data.fields.map(field => {
                            if (field.value) {
                                return <div key={field.id}>
                                    <strong>{field.name}</strong>
                                    <p>{field.value}</p>
                                </div>
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