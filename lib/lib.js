// This file allows us to create functions that can be arbitrarily called from anywhere

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

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
const convertBytesToUnit = (bytes) => {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const decimals = 2
    const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

const lib = {
    buildQueryString: buildQueryString,
    limitQueryByFamily: limitQueryByFamily,
    cookieObjectToString: cookieObjectToString,
    getFilePath: getFilePath,
    convertBytesToUnit: convertBytesToUnit
}

export default lib