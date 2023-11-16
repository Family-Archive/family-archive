import Record from '@/lib/classes/RecordTypes/record'

class Image extends Record {
    constructor() {
        super(
            'Image',
            'image',
            [
                {
                    name: 'person',
                    label: 'Who is related to this image?',
                    type: 'PersonSelector'
                },
                {
                    name: 'date',
                    label: 'When was this image created?',
                    type: 'DateSelector'
                },
                {
                    name: 'location',
                    label: 'Where was this image created?',
                    type: 'LocationSelector'
                }
            ]
        )
    }
}

module.exports = Image