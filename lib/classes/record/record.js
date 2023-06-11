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

        //Insert basic record object
        const record = await prisma.Record.create({
            data: {
                name: requestData.Name,
                description: requestData.Description,
                type: params.type,
                userCreatedId: session.user.id
            },
        })

        // Iterate through requestData and insert custom fields into DB when applicable
        for (let field of Object.keys(requestData)) {
            if (['Name', 'Description'].includes(field)) {
                continue
            }

            const customField = await prisma.RecordField.create({
                data: {
                    name: field,
                    value: requestData[field],
                    recordId: record.id
                },
            })
        }
    }

}

export default Record