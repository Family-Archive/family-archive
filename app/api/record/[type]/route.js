export async function GET(request, { params }) {
    switch (params.type) {
        case 'basic':
            return Response.json({
                'type': 'basic',
                'name': 'Basic Record',
                'fields': [
                    {
                        'name': 'Name',
                        'type': 'text'
                    },
                    {
                        'name': 'Description',
                        'type': 'textarea'
                    }
                ]
            })
            break;
    }

}

export async function POST(request, { params }) {
    console.log('call gtl')
}
