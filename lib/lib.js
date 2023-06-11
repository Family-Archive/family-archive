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