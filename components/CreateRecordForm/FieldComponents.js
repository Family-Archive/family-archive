// Dynamically build object of FieldComponents

import fs from 'fs'
import path from 'path'
import { lazy } from 'react'

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
        const { default: FieldComponent } = await import(`/components/FieldComponents/${directoryName}/${componentFile}`)
        // const FieldComponent = await importComponent(`/components/FieldComponents/${directoryName}/${componentFile}`)
        console.log('Imported field component')
        console.log(FieldComponent)
        components[componentFile.split('.')[0]] = FieldComponent
    }
}

export default components