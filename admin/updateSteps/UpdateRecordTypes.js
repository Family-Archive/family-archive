const UpdateStep = require('../updateStep.js')
const fs = require('node:fs')
require('dotenv/config.js')

class UpdateRecordTypes extends UpdateStep {
    constructor() {
        super(5, 'Update Record Types')
    }

    run() {

    }
}

module.exports = UpdateRecordTypes