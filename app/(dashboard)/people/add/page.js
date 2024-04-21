import Form from "@/components/Form/Form"

/**
 * This page displays a form for creating a new person
 */

const createPerson = () => {
    return <div className="column">
        <h1 className="title">Add new person</h1>
        <Form
            method="POST"
            action={`/api/people/`}
            fields={[
                {
                    name: 'fullName',
                    label: 'Full Name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'shortName',
                    label: 'Short name',
                    type: 'text',
                    required: true
                },
                {
                    name: 'birthdate',
                    label: 'Date of birth',
                    type: 'date',
                },
                {
                    name: 'deathdate',
                    label: 'Date of death',
                    type: 'date',
                }
            ]}
            acceptedFileTypes={[
                "image/png",
                "image/jpeg",
                "image/gif"
            ]}
            allowMultipleFiles={false}
            requireFileUploadFirst={false}
            loadFilesFromUrl={false}
        />
    </div>
}

export default createPerson
