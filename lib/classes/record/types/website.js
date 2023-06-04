import Record from "../record";

class Website extends Record {

    constructor() {
        super('Website', 'website', [
            {
                'name': 'Person Selector',
                'type': 'PersonSelector'
            },
            {
                'name': 'URL',
                'type': 'url'
            }
        ])
    }

}

module.exports = Website