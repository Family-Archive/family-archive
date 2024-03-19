import { prisma } from "../../db/prisma"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import lib from "../../../lib/lib"
import permissionLib from "@/lib/permissions/lib";

// Fetch all records. Parameters can be passed to sort + filter
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
    const sortField = params.get('sort') || 'name'
    const direction = params.get('dir') || 'asc'
    const startdate = params.get('startdate') || null
    const enddate = params.get('enddate') || null
    const people = params.get('people') || null

    const page = params.get('page') || '1'

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
        orderBy: {
            [sortField]: direction
        },
        include: {
            RecordField: true
        },
        where: where
    })


    // TODO: ughhh.... we need an efficient way to select only the records we need.
    // ideally we could do this in the select query, to just get the right records from the database,
    // but because of how complex the filters can be, plus the need to check the read permission on each record,
    // I don't see any other way to do it except to select all records, and then iterate through each to determine
    // if it should be shown -- but this is really inefficient.

    // I tried to optimize a little bit by only going through until we've reached the maximum possible number of records
    // for the amount of pages we're on (see line 126), but the problem with this is that we then can't accurately determine
    // the exact number of pages. For instance, if there are 41 records and one of them is hidden to a user, an admin would get 3 pages
    // (2 with 20 records each and a 3rd with one record) and the other user should get 2 pages (since one record is hidden)
    // But right now, we get the page number before doing the permission check, so the other user gets 3 pages, with the last one
    // containing no records on it.

    // Something to think about. How do we do this efficiently?

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

    const numPages = Math.ceil(finalArray.length / 20)

    // slice array into blocks of 20
    let filteredArray = []
    for (let record of finalArray) {
        if (await permissionLib.checkPermissions(session.user.id, 'Record', record.id, 'read')) {
            filteredArray.push(record)
        }
        if (filteredArray.length === page * 20) {
            break
        }
    }
    finalArray = filteredArray.slice((page - 1) * 20)

    return Response.json({
        status: 'success',
        data: {
            records: finalArray,
            numPages: numPages
        }
    }, {
        status: 201
    });
}