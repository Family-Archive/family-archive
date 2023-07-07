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

const ViewRecord = async ({ params }) => {
    const recordData = await fetchRecord(params);
    const record = recordData.data.record

    console.log(recordData.data.files)

    return (
        <div className={styles.ViewRecord}>
            <h1 className='title'>{record.name}</h1>
            <div className={styles.infoBar}>
                <span className={styles.type}>{record.type}</span>
                <BreadcrumbTrail />
            </div>
        </div>
    )
}

export default ViewRecord