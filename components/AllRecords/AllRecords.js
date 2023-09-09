import Link from 'next/link'

import lib from '../../lib/lib'
import ViewFilter from '../ViewFilter/ViewFilter'
import PageSelector from '../PageSelector/PageSelector'
import styles from './AllRecords.module.scss'
import { cookies } from 'next/dist/client/components/headers'

/**
 * Hit the API endpoint to get a list of records
 * @param {searchParams} params: The searchParams object from the page this component is hosted on
 * @returns The JSON response containing the records
 */
const fetchRecords = async (params) => {
    let queryString = lib.buildQueryString(params)
    let records = await fetch(`${process.env.NEXTAUTH_URL}/api/records${queryString}`,
        {
            next: { tags: ['records'] },
            headers: {
                Cookie: lib.cookieObjectToString(cookies().getAll())
            }
        }
    )
    if (!records.ok) {
        throw new Error('Failed to fetch data')
    }

    return await records.json()
}

const fetchRecordFiles = async (recordId) => {
    let record = await fetch(`${process.env.NEXTAUTH_URL}/api/record/${recordId}`,
        {
            headers: {
                Cookie: lib.cookieObjectToString(cookies().getAll())
            }
        }
    )
    record = await record.json()

    return record.data.files
}

const AllRecords = async (props) => {
    // If passed record list is empty, then use the fetchRecords method

    let recordList = props.records
    if (recordList.length === 0) {
        recordList = await fetchRecords(props.params)
    }

    return (
        <div className={styles.AllRecords}>
            <section className={styles.recordsGrid}>
                {recordList.map(async record => {
                    const recordFiles = await fetchRecordFiles(record.id)

                    return <Link href={`/record/${record.id}`} className={styles.record} key={record.id}>
                        <div className={styles.image} style={{ backgroundImage: recordFiles.length > 0 ? `url('/api/file/${recordFiles[0].id}')` : "" }} />
                        <span className={styles.recordName}>{record.name}</span>
                        <span className={styles.recordType}>{record.type}</span>
                        {/* Right now this displays the created date, but once we have a date selector on records we'll use that value */}
                        <span className={styles.recordDate}>{new Date(Date.parse(record.createdAt)).toLocaleDateString()}</span>
                    </Link>
                })}
            </section>

            {props.showOptions ?
                <section className={styles.viewOptions}>
                    <ViewFilter params={props.params} />
                    <PageSelector page={props.params.page} />
                </section>
                : ""}
        </div>
    )
}

export default AllRecords