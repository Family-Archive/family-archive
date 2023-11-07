import Form from "@/components/Form/Form"
import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib'

/**
 * This page allows the editing of a user
 */

const editUser = async ({ params }) => {
    // Fetch the data for the user we're looking at
    const getUser = async () => {
        let user = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${params.id}`,
            {
                headers: {
                    Cookie: lib.cookieObjectToString(cookies().getAll())
                }
            }
        )
        user = await user.json()
        return user.data.user
    }

    const user = await getUser()

    return (
        <div className="column">
            <h1 className="title">Edit user</h1>
            {/* Create a form for this user and fill in existing data */}
            <Form
                method="PUT"
                action={`/api/users/${params.id}`}
                fields={[
                    {
                        name: 'name',
                        label: 'Name',
                        type: 'text',
                        value: user.name
                    },
                    {
                        name: 'email',
                        label: 'Email',
                        type: 'text',
                        value: user.email
                    }
                ]}
                allowFileUpload={false}
            />
        </div>
    )
}

export default editUser