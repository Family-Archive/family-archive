import Record from "../record";

class Website extends Record {

    constructor() {
        super('Website', 'website', [
            {
                'name': 'Person Selector',
                'type': 'PersonSelector'
            },
            {
                'name': 'Label',
                'type': 'h1',
                'content': "Oh no!",
                'showLabel': false
            },
            {
                'name': 'URL',
                'type': 'url'
            }
        ])
    }

}

module.exports = Website