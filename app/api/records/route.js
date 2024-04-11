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

    // Reformat and filter final results
    let finalArray = []
    for (let result of results) {
        if (!await permissionLib.checkPermissions(session.user.id, 'Record', result.id, 'read')) {
            // Don't add records to the final array that the user can't read
            continue
        }

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

    // get the number of pages and slice the array if paginating
    // we could make this arbitrary 20 a variable in the future to allow different page sizes
    const numPages = Math.ceil(finalArray.length / 20)
    if (params.get('paginate')) {
        finalArray = finalArray.slice((page - 1) * 20, ((page - 1) * 20) + 20)
    }

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