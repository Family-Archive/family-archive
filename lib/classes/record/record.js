class Record {

    name
    type
    fields

    constructor(name, type, fields) {
        const baseFields = [
            {
                'name': 'Name',
                'type': 'text'
            },
            {
                'name': 'Description',
                'type': 'textarea'
            }
        ]

        this.name = name
        this.type = type
        this.fields = [].concat(baseFields, fields)
    }

    getStructure() {
        return {
            name: this.name,
            type: this.type,
            fields: this.fields
        }
    }

    async insert(request, { params }, session) {
        let requestData = await request.formData()
        requestData = Object.fromEntries(requestData)

        //TODO: make this dynamic based on the fields given
        const record = await prisma.Record.create({
            data: {
                name: requestData.Name,
                description: requestData.Description,
                userCreatedId: session.user.id
            },
        })
    }

}

export default Record