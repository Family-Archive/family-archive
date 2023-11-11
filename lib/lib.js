// This file allows us to create functions that can be arbitrarily called from anywhere
import { prisma } from '@/app/db/prisma'

/**
 * Given an object mapping parameter keys to values, create a URL query string
 * @param {object} paramsObject: The map of parameter keys to values
 * @returns the query string to append to the URL path
 */
const buildQueryString = (paramsObject) => {
    let queryString = "?"
    for (let param of Object.keys(paramsObject)) {
        queryString += `${param}=${paramsObject[param]}&`
    }

    return queryString
}

/**
 * Given a properly-formatted Prisma query conditional and a user session, return a query that is formatted to filter by family
 * @param {object} queryObject: The object that can be passed to Prisma to limit the query
 * @param {object} cookies: The request.cookies object
 * @returns An properly-formatted Prisma query conditional that filters by familyId
 */
const limitQueryByFamily = (queryObject, cookies, session) => {
    const familyId = cookies.get('familyId')?.value ? cookies.get('familyId').value : session.user.defaultFamily.id

    return {
        AND: [
            queryObject,
            {
                familyId: familyId
            }
        ]
    }
}

/**
 * Given an object of cookies from cookies().getAll(), turn this into a string we can pass in a fetch request
 * @param {object} cookies: The object of cookie data
 * @returns a cookie string that can be passed in the header of a fetch request
 */
const cookieObjectToString = (cookies) => {
    let cookieString = ""
    for (let cookie of cookies) {
        cookieString += `${cookie.name}=${cookie.value}; `
    }
    return cookieString
}

const getFilePath = (fileHash) => {
    return `${process.env.FILESTORAGE_PATH}/${fileHash.slice(0, 2)}/${fileHash.slice(2, 4)}/${fileHash.slice(4)}`
}

const getSetting = async (name, context = 'general') => {
    const setting = await prisma.setting.findFirst({
        where: {
            context: context,
            name: name
        }
    })

    return setting === null ? null : setting.value
}

const setSetting = async (name, value, context = 'general') => {
    // Does this setting already exist in the database?
    const setting = await prisma.setting.findFirst({
        where: {
            context: context,
            name: name
        }
    })

    // If the setting exists, update it.
    if (setting) {
        await prisma.setting.update({
            where: {
                id: setting.id
            },
            data: {
                value: value
            }
        })
    }

    // Otherwise, create the setting.
    else {
        await prisma.setting.create({
            data: {
                context: context,
                name: name,
                value: value
            }
        })
    }
}

/**
 * Queries a record and checks its fields to see if the required fields are filled out to consider the record complete
 * At the moment this just checks the Person, Date, and Location field; if we want different fields to be considered complete for different record types,
 * I'd suggest we make a property defining this to the recordtype config -- then we can add a method to the RecordType class to return required fields for completion,
 * and check in this function if those fields are filled
 * Note: this doesn't trigger if the recordtype doesn't support these fields -- but every record type should.
 * @param {string} id: The ID of the record to check
 */
const updateRecordCompletion = async (id) => {
    // We could also check the "name" field on the record, maybe, but I'm assuming that we'd actually have client-side validation preventing the record from saving at all
    // if the name field isn't filled out
    const requiredRecordFields = [
        'person',
        'date',
        'location'
    ]

    // Get record and related record fields
    let record = await prisma.record.findUnique({
        where: {
            id: id
        }
    })
    const recordFields = await prisma.recordField.findMany({
        where: {
            recordId: id
        }
    })

    // Iterate through each record field, check if it matches one of the fields we want to require, 
    // and if it does, ensure that it has a value
    let completed = true
    for (let field of recordFields) {
        for (let fieldName of requiredRecordFields) {
            if (field.name === fieldName && !field.value) {
                completed = false
            }
        }
    }

    // Finally, if the completed value doesn't equal the record's current state in the database, update it
    if (completed !== record.completed) {
        record = await prisma.record.update({
            where: { id: id },
            data: {
                completed: completed
            }
        })
    }

    return record
}

/**
 * This function checks if a user should be able to access a resource.
 * At the moment it just checks if the user belongs to the same family as the resource, but could be extended later
 * for a more complex permission system.
 * @param {string} userId: The ID of the user
 * @param {string} resourceName: The name of the resource. This must match a table name in Prisma
 * @param {string} resourceId: The ID of the resource
 */
const checkPermissions = async (userId, resourceName, resourceId) => {
    let user = await prisma.User.findUnique({
        where: {
            id: userId
        },
        include: {
            families: true
        }
    })

    let resource = await prisma[resourceName].findUnique({
        where: {
            id: resourceId
        }
    })

    let userBelongsToResourceFamily = false
    for (let family of user.families) {
        if (family.id === resource.familyId) {
            userBelongsToResourceFamily = true
        }
    }

    return userBelongsToResourceFamily
}

const lib = {
    buildQueryString: buildQueryString,
    limitQueryByFamily: limitQueryByFamily,
    getFilePath: getFilePath,
    cookieObjectToString: cookieObjectToString,
    getSetting: getSetting,
    setSetting: setSetting,
    updateRecordCompletion: updateRecordCompletion,
    checkPermissions: checkPermissions
}

export default lib