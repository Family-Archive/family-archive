const UpdateStep = require('../updateStep.js')
const fs = require('node:fs')
require('dotenv/config.js')

class UpdateFieldComponentsFile extends UpdateStep {

    componentsDirectoryPath
    components

    constructor() {
        super(10, 'Update Field Components File')

        this.componentsDirectoryPath = `${process.env.APPLICATION_ROOT}/components/Form/FieldComponents`
        this.components = []
    }

    run() {
        const componentDirectoryFiles = fs.readdirSync(this.componentsDirectoryPath)

        componentDirectoryFiles.forEach(directory => {
            const fullComponentPath = `${this.componentsDirectoryPath}/${directory}`

            // Check if this item is a directory before continuing.
            const stats = fs.statSync(fullComponentPath)
            if (stats.isDirectory()) {

                // Verify that a file with the same name as the directory exists.
                const componentDirectoryContents = fs.readdirSync(fullComponentPath)
                if (componentDirectoryContents.includes(`${directory}.jsx`)) {

                    // Add the component file to the array of all components
                    this.components.push({
                        path: `./FieldComponents/${directory}/${directory}`,
                        name: directory
                    })
                }
            }
        })

        // Write the updated file.
        fs.writeFileSync(`${process.env.APPLICATION_ROOT}/components/Form/FieldComponentsGenerated.js`, this.getFileContents())
    }

    // Generate the file contents as a string
    getFileContents() {
        let contents = ''
        this.components.forEach(component => {
            contents += `import ${component.name} from '${component.path}'\n`
        })

        contents += `\nexport default {`

        this.components.forEach((component, index) => {
            contents += `\n\t${component.name}: ${component.name}${index === this.components.length - 1 ? '' : ','}`
        })

        contents += `\n}`

        return contents
    }
}

module.exports = UpdateFieldComponentsFile