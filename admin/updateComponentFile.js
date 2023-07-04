const fs = require('node:fs')
require('dotenv').config()

const componentsDirectoryPath = `${process.env.APPLICATION_ROOT}/components/Form/FieldComponents`

const componentDirectoryFiles = fs.readdirSync(componentsDirectoryPath)
let components = []

componentDirectoryFiles.forEach(directory => {
    const fullComponentPath = `${componentsDirectoryPath}/${directory}`

    // Check if this item is a directory before continuing.
    const stats = fs.statSync(fullComponentPath)
    if (stats.isDirectory()) {

        // Verify that a file with the same name as the directory exists.
        const componentDirectoryContents = fs.readdirSync(fullComponentPath)
        if (componentDirectoryContents.includes(`${directory}.jsx`)) {

            // Add the component file to the array of all components
            components.push({
                path: `./FieldComponents/${directory}/${directory}`,
                name: directory
            })
        }
    }
})

// Write the updated file.
fs.writeFileSync(`${process.env.APPLICATION_ROOT}/components/Form/FieldComponentsGenerated.js`, getFileContents(components))

// Generate the file contents as a string
function getFileContents(componentDirectories) {
    let contents = ''
    componentDirectories.forEach(component => {
        contents += `import ${component.name} from '${component.path}'\n`
    })

    contents += `\nexport default {`

    componentDirectories.forEach((component, index) => {
        contents += `\n\t${component.name}: ${component.name}${index === componentDirectories.length - 1 ? '' : ','}`
    })

    contents += `\n}`

    return contents
}
