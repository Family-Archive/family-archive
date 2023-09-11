/**
 * Record type pages can have a "files" URL parameter that
 * lists one or more file ids already in storage that should
 * be loaded into the file selector when the form is rendered.
 * This function retrieves those files from storage and gets
 * them into the format the Form component is expecting.
 * 
 * @return array of files
 */
async function getFileFromUrlParam(searchParams) {
    const response = await fetch(`${process.env.BASE_URL}/api/file/${searchParams.files}`)
    const json = await response.json()

    if (json.status === 'error') {
        return []
    }

    return [json.data.file]

}

module.exports = {
    getFileFromUrlParam: getFileFromUrlParam
}