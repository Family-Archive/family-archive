import Record from '@/lib/classes/RecordTypes/record'

class File extends Record {
    constructor() {
        super(
            'File',
            'file',
            []
        )
    }
}

module.exports = File