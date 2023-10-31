import { cookies } from 'next/dist/client/components/headers'
import dynamic from 'next/dynamic'
import lib from "@/lib/lib"

import styles from './mapPage.module.scss'

const filterRecordsWithoutLocationFields = records => {
    let recordsWithLocationFields = []
    for (const record of records) {
        let hasLocationField = false
        for (let recordField of record.RecordField) {
            if (recordField.name === 'location' && recordField.value) {
                hasLocationField = true
                break
            }
        }
        if (hasLocationField) {
            recordsWithLocationFields.push(record)
        }
    }

    return recordsWithLocationFields
}

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
    return records.data.records
}

const mapPage = async ({ searchParams }) => {
    let data = await fetchRecords(searchParams)
    data = filterRecordsWithoutLocationFields(data)

    // Have to load this in a special way or leaflet throws errors
    const RecordMap = dynamic(
        () => import("@/components/RecordMap/RecordMap"), {
        ssr: false,
    });

    return (
        <div className={styles.mapPage}>
            <h1 className='title'>Map</h1>
            <RecordMap data={data} params={searchParams} />
        </div>
    )
}

export default mapPage