export async function GET(request) {
    // Some logic here to dynamically fetch record types and return their data
    // What's most relational-databasey would probably be to have a record_type table containing data for shared fields (type, name, etc)
    // And then a record_type_fields table that has an entry for each field that a record type contains

    // Then this could be replaced by a select query

    // For now I'm just going to hardcode this as a mockup
    return Response.json([
        {
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
        }
    ])
}