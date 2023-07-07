import { cookies } from 'next/dist/client/components/headers'
import lib from '../../../../lib/lib'

import styles from './ViewRecord.module.scss'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'

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

    console.log(recordData.data.fields)

    return (
        <div className={styles.ViewRecord}>
            <h1 className='title'>{record.name}</h1>
            <div className={styles.infoBar}>
                <span className={styles.type}>{record.type}</span>
                <BreadcrumbTrail name={record.name} />
            </div>
            <div className={styles.mainContent}>
                <div className={styles.file} />
                <div className={styles.info}>
                    <strong>Description</strong>
                    <p>{record.description}</p>
                    {recordData.data.fields.map(field => {
                        return <div key={field.id}>
                            <strong>{field.name}</strong>
                            <p>{field.value}</p>
                        </div>
                    })}
                </div>
                <div className={styles.otherInfo}>
                    <h2>Details</h2>
                    <strong>Created by</strong>
                    <p>{record.userCreatedId}</p>
                    <strong>Created at</strong>
                    <p>{record.createdAt}</p>
                    <strong>Last updated</strong>
                    <p>{record.updatedAt}</p>
                    <strong>Family ID</strong>
                    <p>{record.familyId}</p>
                </div>
            </div>
        </div>
    )
}

export default ViewRecord