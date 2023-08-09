import fs from 'fs'
import path from 'path'

export async function GET(request) {
    // Some logic to dynamically fetch record types
    // This is an example: it iterates through all the record types defined in api/record/[type]/(types)
    // and adds them to an array to return so we can display them on the page

    const pathName = path.join(process.cwd(), "recordtypes")
    let types = []
    const files = fs.readdirSync(pathName)
    for (let filename of files) {
        const RecordType = require(`recordtypes/${filename}/record`)
        const recordType = new RecordType()
        let type = await recordType.getStructure()
        types.push(type)
    }

    return Response.json(types)
}