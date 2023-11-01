import { prisma } from "../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from "../../../lib/lib"

export async function GET(request) {
    const params = request.nextUrl.searchParams
    const session = await getServerSession(authOptions);
    if (!session) {
        return Response.json({
            'status': 'error',
            'message': 'Not authorized'
        }, {
            status: 401
        })
    }

    // Pull out explicit params
    const sortField = params.get('sort') ? params.get('sort') : 'name'
    const direction = params.get('dir') ? params.get('dir') : 'asc'
    const startdate = params.get('startdate') ? params.get('startdate') : null
    const enddate = params.get('enddate') ? params.get('enddate') : null
    const people = params.get('people') ? params.get('people') : null

    const page = params.get('page') ? params.get('page') : '1'
    const take = page * 20
    const skip = take - 20

    // Build a WHERE object from the filters passed
    // Note how separate filters are conjoined, but different values of the same filter are disjoined
    let where = {}
    if (params.get('filters')) {
        where = { AND: [] }
        const filterObject = JSON.parse(params.get('filters'))
        for (let filter of Object.keys(filterObject)) {
            let orBlock = []
            for (let value of filterObject[filter]) {
                orBlock.push({ [filter]: { contains: value } })
            }
            where.AND.push({ OR: orBlock })
        }
    }

    where = lib.limitQueryByFamily(where, request.cookies, session)

    const results = await prisma.Record.findMany({
        skip: skip,
        take: take,
        orderBy: {
            [sortField]: direction
        },
        include: {
            RecordField: true
        },
        where: where
    })

    // Reformat and filter final results
    let finalArray = []
    for (let result of results) {
        // Add icon information
        const RecordType = require(`/recordtypes/${result.type}/record.js`)
        const recordType = new RecordType()
        const icon = recordType.getRecordTypeIcon()
        result.icon = icon

        // put significant record fields on the top level for easy access
        if (result.RecordField) {
            for (const recordField of result.RecordField) {
                if (['date', 'person', 'location'].includes(recordField.name)) {
                    try {
                        result[recordField.name] = JSON.parse(recordField.value)
                    } catch { /* probably null or something, just don't include it */ }
                }
            }
        }

        // filter out records if they don't meet specific recordfield criteria
        let addToFinalArray = true
        if (startdate) {
            if (!result.date || !result.date.startdate || result.date.startdate < startdate) {
                addToFinalArray = false
                continue
            }
        }
        if (enddate) {
            if (!result.date || !result.date.enddate || result.date.enddate > enddate) {
                addToFinalArray = false
                continue
            }
        }
        if (people) {
            let hasPerson = false
            for (let person of people.split(',')) {
                if (result.person?.includes(person)) {
                    hasPerson = true
                    break
                }
            }
            if (!hasPerson) {
                addToFinalArray = false
                continue
            }
        }

        if (addToFinalArray) {
            finalArray.push(result)
        }
    }

    return Response.json({
        status: 'success',
        data: {
            records: finalArray
        }
    }, {
        status: 201
    });
}