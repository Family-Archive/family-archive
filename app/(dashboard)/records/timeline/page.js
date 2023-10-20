import { prisma } from "../../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/dist/client/components/headers'

import styles from './timelinePage.module.scss'
import Timeline from '../../../../components/Timeline/Timeline'
import lib from "@/lib/lib"

const filterRecordsWithoutDateFields = records => {
    let recordsWithDateFields = []
    for (let record of records) {
        let hasDateField = false
        for (let recordField of record.RecordField) {
            if (recordField.name === 'date') {
                hasDateField = true
            }
        }
        if (hasDateField) {
            recordsWithDateFields.push(record)
        }
    }

    return recordsWithDateFields
}

const timelinePage = async ({ searchParams }) => {

    // Fetch records with date data
    const session = await getServerSession(authOptions);
    const where = lib.limitQueryByFamily({}, cookies(), session)
    let result = await prisma.record.findMany({
        include: {
            RecordField: {
                where: {
                    OR: [
                        {
                            name: {
                                equals: 'date'
                            }
                        },
                        {
                            name: {
                                equals: 'person'
                            }
                        },
                    ]
                }
            },
        },
        where: where
    })

    // Remove any records that don't have date fields
    result = filterRecordsWithoutDateFields(result)

    // Iterate through the remaining records and ensure they match all query params
    let data = []
    for (let record of result) {
        if (record.RecordField.length > 0) {
            let matchesConditions = true
            for (let recordField of record.RecordField) {

                // If this is a person record field, and we're filtering on people, make sure that at least one person connected to this record is in the list
                if (recordField.name === 'person' && searchParams.people) {
                    const personVal = JSON.parse(recordField.value)
                    let personFound = false
                    for (let person of personVal) {
                        if (searchParams.people.split(',').includes(person)) {
                            personFound = true
                        }
                        break
                    }
                    if (!personFound) {
                        matchesConditions = false
                        break
                    }
                }

                // If we're filtering on dates, make sure that the record's startdate and enddate are after and before the start + date we're filtering on, respectivley
                if (recordField.name === 'date') {
                    const dateVal = JSON.parse(recordField.value)
                    record['date'] = dateVal
                    if (dateVal.startdate) {
                        if (searchParams.startdate && (searchParams.startdate > dateVal.startdate || searchParams.enddate < dateVal.enddate)) {
                            matchesConditions = false
                        }
                    }
                }
            }

            // If we didn't mark any conditions false, add this record to the data array
            if (matchesConditions) {
                data.push(record)
            }
        }
    }

    return (
        <>
            <h1 className='title'>Timeline</h1>
            {data.length > 0 ?
                <Timeline data={data} />
                : <span>There are no records matching the current timeline criteria.</span>
            }
        </>
    )
}

export default timelinePage