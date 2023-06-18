// Dynamically build object of FieldComponents

import fs from 'fs'
import path from 'path'

const pathName = path.join(process.cwd(), "components/FieldComponents")
let components = {}
const directories = fs.readdirSync(pathName)

// Search two directories deep.
for (let directoryName of directories) {
    const currentPath = path.join(pathName, directoryName)

    // If this is a directory, load the component within it.
    if (fs.existsSync(currentPath) && fs.lstatSync(currentPath).isDirectory()) {
        // There should be exactly one .jsx file in this directory.
        const files = fs.readdirSync(currentPath)
        const componentFile = files.find(fileName => fileName.includes('.jsx'))
        const FieldComponent = require(`/components/FieldComponents/${directoryName}/${componentFile}`)
        components[componentFile.split('.')[0]] = FieldComponent
    }
}

export default components