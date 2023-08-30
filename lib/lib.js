// This file allows us to create functions that can be arbitrarily called from anywhere
import { prisma } from '@/app/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { cookies } from 'next/headers'

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

const getCurrentFamilyId = async () => {
    const session = await getServerSession(authOptions)
    const cookieStore = cookies()

    return cookieStore.get('familyId')?.value ? cookieStore.get('familyId').value : session.user.defaultFamily.id
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

const lib = {
    buildQueryString: buildQueryString,
    limitQueryByFamily: limitQueryByFamily,
    getFilePath: getFilePath,
    getCurrentFamilyId: getCurrentFamilyId,
    cookieObjectToString: cookieObjectToString,
    getSetting: getSetting,
    setSetting: setSetting
}

export default lib