/**
 * Check the mime type of a file object and get the name of
 * a record type that matches it.
 * 
 * @param {File} file 
 * @return string
 */
function getRecordTypeFromMimeType(file) {
    console.log(file)

    // Get first part of mime type.
    const type = file.type.substring(0, file.type.indexOf('/'))

    // First check common file types with a multitude of specific codecs.
    switch (type) {
        case 'video':
            return 'video'

        case 'image':
            return 'image'

        case 'audio':
            return 'audio'

        case 'text':
            return 'document'
    }

    // Now check for other common file types based on their full mime type.
    switch (file.type) {
        case 'application/pdf':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/vnd.ms-word.document.macroEnabled.12':
        case 'application/msword':
            return 'document'

        default:
            return 'otherfile'
    }
}

module.exports = {
    getRecordTypeFromMimeType: getRecordTypeFromMimeType
}