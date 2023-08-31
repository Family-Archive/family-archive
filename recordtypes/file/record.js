import Record from '@/lib/RecordTypes/record'

class File extends Record {
    constructor() {
        super(
            'File',
            'file',
            [
                {
                    'name': 'Who is featured in this file?',
                    'type': 'PersonSelector'
                }
            ]
        )
    }
}

module.exports = File