import Record from '@/lib/RecordTypes/record'

class Image extends Record {
    constructor() {
        super(
            'Image',
            'image',
            [
                {
                    name: 'Who is related to the image?',
                    type: 'PersonSelector'
                },
                {
                    name: 'When the image was created',
                    type: 'date'
                },
                {
                    name: 'Where the image was created',
                    type: 'text'
                }
            ]
        )
    }
}

module.exports = Image