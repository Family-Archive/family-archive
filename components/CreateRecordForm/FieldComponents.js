// Dynamically build object of FieldComponents

import fs from 'fs'
import path from 'path'

const pathName = path.join(process.cwd(), "components/CreateRecordForm/FieldComponents")
let components = {}
const files = fs.readdirSync(pathName)
for (let filename of files) {
    const FieldComponent = require(`/components/CreateRecordForm/FieldComponents/${filename}`)
    components[filename.split('.')[0]] = FieldComponent
}

export default components