import { cookies } from 'next/dist/client/components/headers'

import styles from './timelinePage.module.scss'
import Timeline from '../../../../components/Timeline/Timeline'
import lib from "@/lib/lib"
import ViewFilter from "@/components/ViewFilter/ViewFilter";

const filterRecordsWithoutDateFields = records => {
    let recordsWithDateFields = []
    for (const record of records) {
        let hasDateField = false
        for (let recordField of record.RecordField) {
            if (recordField.name === 'date' && recordField.value) {
                hasDateField = true
                break
            }
        }
        if (hasDateField) {
            recordsWithDateFields.push(record)
        }
    }

    return recordsWithDateFields
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

const timelinePage = async ({ searchParams }) => {

    let data = await fetchRecords(searchParams)
    data = filterRecordsWithoutDateFields(data)

    return (
        <div className={styles.timelinePage}>
            <h1 className='title'>Timeline</h1>
            {data.length > 0 ?
                <Timeline data={data} />
                : <span>There are no records matching the current timeline criteria.</span>
            }
            <div class={styles.tlViewFilter}>
                <ViewFilter params={searchParams} sortOptions={false} />
            </div>
        </div>
    )
}

export default timelinePage