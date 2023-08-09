/**
 * This script updates any auto-generated files, checks for
 * new record types, and adds any necessary settings to the
 * database.
 * 
 * This script should be run any time field components are
 * added or removed and any time record types are added or
 * removed.
 */
const fs = require('node:fs')
require('dotenv/config.js')

console.log('Beginning update steps')

// Scan the update steps directory to get a list of update steps.
const stepDirectoryFiles = fs.readdirSync(`${process.env.APPLICATION_ROOT}/admin/updateSteps`)

stepPromises = []

for (const stepName of stepDirectoryFiles) {
    stepPromises.push(importStep(stepName))
}

Promise.all(stepPromises).then(steps => {
    // Order steps by priority.
    steps.sort((a, b) => {
        let comparison = 0

        if (a.priority !== b.priority) {
            comparison = a.priority > b.priority ? 1 : -1
        }

        return comparison
    })

    // Run each step.
    steps.forEach(Step => {
        let stepInstance = new Step()
        console.log(`+++ Running step: ${stepInstance.name}`)
        stepInstance.run()
        console.log(`--- Step complete`)
    })

    console.log('Finished update steps')
})

/**
 * Import a step dynamically. This must be done asynchronously,
 * so we're putting it in its own separate function that returns
 * a promise which resolves to a Step class.
 * 
 * @param {string} stepName 
 * @returns Step class
 */
async function importStep(stepName) {
    let step = await import(`./updateSteps/${stepName}`)
    return step.default;
}