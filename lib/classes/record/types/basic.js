import Record from "../record";

class Basic extends Record {

    constructor() {
        super('Basic Record', 'basic', [
            {
                'name': 'Person Selector',
                'type': 'PersonSelector'
            }
        ])
    }

}

module.exports = Basic