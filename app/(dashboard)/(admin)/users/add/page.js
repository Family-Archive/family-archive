import Form from "@/components/Form/Form"

/**
 * This page displays a form for creating a new user
 */

const createPerson = () => {
    return <div className="column">
        <h1 className="title">Add new user</h1>
        <Form
            method="POST"
            action={`/api/users/`}
            fields={[
                {
                    name: 'email',
                    label: 'Email',
                    type: 'email',
                    required: true,
                },
                {
                    name: 'name',
                    label: 'Name',
                    type: 'text',
                    required: true,
                },
                {
                    name: 'password',
                    label: 'Password',
                    type: 'password',
                },
                {
                    name: 'families',
                    label: 'Add user to families',
                    type: 'FamilySelector',
                },
                {
                    name: 'emailpassword',
                    label: 'Generate a password and email it to the user',
                    type: 'Selector',
                    value: {
                        options: [
                            { name: "Yes", value: "1" },
                            { name: "No", value: "0" },
                        ],
                        defaultOption: "0"
                    }
                },
            ]}
            allowFileUpload={false}
            redirectLocation="/users"
        />
    </div>
}

export default createPerson