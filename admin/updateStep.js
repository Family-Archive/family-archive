/**
 * UpdateStep
 * 
 * This class serves as an interface for a single step
 * that needs to be performed when the update script runs.
 * 
 * Every class in the updateSteps directory should extend
 * this class.
 */
class UpdateStep {

    priority
    name

    constructor(priority, name) {
        this.priority = priority
        this.name = name
    }

    run() {
        throw new Error(`Update step ${this.name} must implement run() method.`)
    }
}

module.exports = UpdateStep