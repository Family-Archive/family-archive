import Link from 'next/link'

import lib from '../../lib/lib'
import ViewFilter from '../ViewFilter/ViewFilter'
import PageSelector from '../PageSelector/PageSelector'
import styles from './AllRecords.module.scss'
import { cookies } from 'next/dist/client/components/headers'

/**
 * This component displays records. Despite the name "AllRecords," it also can take an explicit list of record objects to display
 * Optional prop {Array} records: A list of record objects to display
 * Optional prop {Bool} showOptions: Whether or not to show the sorting/filtering option sidebar. Defaults to false
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

    return await records.json()
}

/**
 * Given a record ID, get all the files connected to this record
 * @param {string} recordId: The ID of the record to get the files for
 * @returns {Array}: The list of files
 */
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
                    // Get all files for this record and then search the list for a photo
                    const recordFiles = await fetchRecordFiles(record.id)
                    const photo = findFirstPhoto(recordFiles)

                    return <Link href={`/record/${record.id}`} className={styles.record} key={record.id}>
                        {/* If we found an image in this record's files, use it as the background image */}
                        <div className={styles.image} style={{ backgroundImage: photo ? `url('/api/file/${photo.id}')` : "" }} />

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