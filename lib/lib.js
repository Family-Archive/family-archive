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

const lib = {
    buildQueryString: buildQueryString
}

export default lib