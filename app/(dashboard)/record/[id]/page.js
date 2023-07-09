import { cookies } from 'next/dist/client/components/headers'
import lib from '../../../../lib/lib'
import { prisma } from "../../../db/prisma"
import Image from 'next/image'

import styles from './ViewRecord.module.scss'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
import FileViewer from '@/components/FileViewer/FileViewer'

const fetchRecord = async (params) => {
    const record = await fetch(`${process.env.NEXTAUTH_URL}/api/record/${params.id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    return await record.json()
}

const ViewRecord = async ({ params, searchParams }) => {
    const recordData = await fetchRecord(params);
    const record = recordData.data.record

    // Fetch people connected to record by reading the custom "Person" field
    let people = []
    for (let field of recordData.data.fields) {
        if (field.name === "Person") {
            for (let id of JSON.parse(field.value)) {
                const person = await prisma.person.findFirst({
                    where: { id: id }
                })
                people.push(person)
            }
        }
    }

    return (
        <div className={styles.ViewRecord}>
            <h1 className='title'>{record.name}</h1>
            <div className={styles.infoBar}>
                <span className={styles.type}>{record.type}</span>
                <BreadcrumbTrail name={record.name} />
            </div>

            <div className={styles.mainContent}>

                <div className={styles.content}>
                    <div className={styles.file}>
                        {/* <Image src={`/api/file/${recordData.data.files[0].id}`} width={500} height={500} /> */}
                        <FileViewer files={recordData.data.files} />
                    </div>
                    <div className={styles.info}>
                        <strong>Description</strong>
                        <p>{record.description}</p>

                        {recordData.data.fields.map(field => {
                            return <div key={field.id}>
                                <strong>{field.name}</strong>
                                <p>{field.value}</p>
                            </div>
                        })}

                        <div className={styles.people}>
                            <span className={`${styles.icon} material-icons`}>boy</span>
                            {people.map(person => {
                                return <button className={styles.person}>
                                    {person.fullName}
                                </button>
                            })}
                        </div>
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