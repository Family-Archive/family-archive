import Record from '@/lib/RecordTypes/record'

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