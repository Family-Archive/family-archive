import Record from '@/lib/RecordTypes/record'

class Website extends Record {
    constructor() {
        super('Website', 'website', [
            {
                'label': 'Person',
                'name': 'PersonSelector',
                'type': 'PersonSelector'
            },
            {
                'name': 'Label',
                'type': 'h1',
                'content': "Oh no!",
                'showLabel': false
            },
            {
                'label': 'URL',
                'name': 'URL',
                'type': 'url'
            }
        ])
    }
}

module.exports = Website