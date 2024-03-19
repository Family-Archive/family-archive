import Link from 'next/link'

import lib from '../../lib/lib'
import clientLib from '@/lib/client/lib'
import ViewFilter from '../ViewFilter/ViewFilter'
import PageSelector from '../PageSelector/PageSelector'
import styles from './AllRecords.module.scss'
import { cookies } from 'next/dist/client/components/headers'

/**
 * This component displays records. Despite the name "AllRecords," it also can take an explicit list of record objects to display
 * Optional prop {Array} records: A list of record objects to display
 * Optional prop {Bool} showOptions: Whether or not to show the sorting/filtering option sidebar. Defaults to false
 * Optional prop {searchParams} params: A searchParams object passed down from the page that is loading this component
 */

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

    records = await records.json()
    return {
        records: records.data.records,
        numPages: records.data.numPages
    }

}

/**
 * Given a record ID, get all the files connected to this record
 * @param {string} recordId: The ID of the record to get the files for
 * @returns {Array}: The list of files
 */
const fetchExtraRecordData = async (recordId) => {
    let record = await fetch(`${process.env.NEXTAUTH_URL}/api/record/${recordId}`,
        {
            headers: {
                Cookie: lib.cookieObjectToString(cookies().getAll())
            }
        }
    )
    record = await record.json()
    return record.data
}

/**
 * Iterate a list of files and return the first photo, if one exists
 * @param {Array} fileArray: A list of file objects
 * @returns {null|Object}: The first photo object in the array, or null if none exist
 */
const findFirstPhoto = (fileArray) => {
    for (let file of fileArray) {
        if (file.mimeType.includes('image')) {
            return file
        }
    }
    return null
}

const AllRecords = async ({ records, params, showOptions }) => {

    // If no record list was passed, use the fetchRecords method
    let recordList
    let numPages
    if (!records) {
        let recordData = await fetchRecords(params)
        recordList = recordData.records
        numPages = recordData.numPages
    } else {
        recordList = records
    }

    return (
        <div className={styles.AllRecords}>
            <section className={`${styles.recordsGrid} recordGrid`}>
                {recordList.map(async record => {
                    // Get all files for this record and then search the list for a photo
                    const recordData = await fetchExtraRecordData(record.id)
                    if (!recordData) {
                        return
                    }
                    const photo = findFirstPhoto(recordData.files)

                    const recordIcon = clientLib.renderIconFromData(recordData.icon)

                    return <Link href={`/record/${record.id}`} className={styles.record} key={record.id}>
                        {/* If we found an image in this record's files, use it as the background image */}
                        <div className={styles.image} style={{ backgroundImage: photo ? `url('/api/file/${photo.id}')` : "" }} >
                            {!photo ? <span className={styles.typeIcon}>{recordIcon}</span> : ""}
                        </div>

                        <span className={styles.recordName}>{record.name}</span>
                        <span className={styles.recordType}>{record.type}</span>

                        {record.date && record.date.startdate ?
                            <span className={styles.recordDate}>{clientLib.renderDate(record.date.startdate, record.date.enddate, record.date.unit)}</span>
                            : ""
                        }

                        <span className={styles.createdDate}>Created on {new Date(record.createdAt).toLocaleDateString()}</span>
                    </Link>
                })}
            </section>

            {showOptions ?
                <section className={styles.viewOptions}>
                    <ViewFilter params={params} sortOptions={true} />
                    <PageSelector page={params.page} numPages={numPages} />
                </section>
                : ""
            }
        </div>
    )
}

export default AllRecords