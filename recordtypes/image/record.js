import Record from '@/lib/RecordTypes/record'

class Image extends Record {
    constructor() {
        super(
            'Image',
            'image',
            [
                {
                    name: 'Is this a photograph?',
                    type: 'Toggle'
                },
                {
                    name: 'Photographer',
                    type: 'PersonSelector'
                },
                {
                    name: 'Pictured in the photo',
                    type: 'PersonSelector'
                },
                {
                    name: 'Related to the image',
                    type: 'PersonSelector'
                },
                {
                    name: 'When the photo was taken',
                    type: 'date'
                },
                {
                    name: 'When the image was created',
                    type: 'date'
                },
                {
                    name: 'Where the photo was taken',
                    type: 'text'
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