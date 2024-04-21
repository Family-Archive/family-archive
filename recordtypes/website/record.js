import Record from '@/lib/classes/RecordTypes/record'

class Website extends Record {
    constructor() {
        super('Website', 'website', [
            {
                'label': 'Person',
                'name': 'person',
                'type': 'PersonSelector'
            },
            {
                'label': 'URL',
                'name': 'url',
                'type': 'url',
                'required': true
            }
        ])
    }
}

module.exports = Website