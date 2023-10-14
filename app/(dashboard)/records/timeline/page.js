import { cookies } from 'next/dist/client/components/headers'

import styles from './timelinePage.module.scss'
import Timeline from '../../../../components/Timeline/Timeline'
import lib from '@/lib/lib'

const timelinePage = async () => {

    // Fetch records with date data
    // This is pretty inefficient... We have to make a network call to the DB to get the list of records, and then for each record, make a call to the /api/record endpoint
    // in order to get the date field

    // Fetch all records
    let records = await fetch(`${process.env.NEXTAUTH_URL}/api/records`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    records = await records.json()

    // For each record, check if we have a date field attached to it, and if so, attach it to the record object and append it to a new array
    let recordsWithDate = []
    for (let record of records) {
        const recordId = record.id

        let recordData = await fetch(`${process.env.NEXTAUTH_URL}/api/record/${recordId}`, {
            headers: {
                Cookie: lib.cookieObjectToString(cookies().getAll())
            }
        })
        recordData = await recordData.json()

        for (let field of recordData.data.fields) {
            if (field.name === "date") {
                const fieldData = JSON.parse(field.value)
                record['date'] = fieldData
                recordsWithDate.push(record)
                break
            }
        }
    }

    return (
        <>
            <h1 className='title'>Timeline</h1>
            <Timeline />
        </>
    )
}

export default timelinePage