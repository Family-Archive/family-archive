import Form from "@/components/Form/Form"
import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib'

/**
 * This page allows the editing of a person
 */

const editPerson = async ({ params }) => {
    // Fetch the data for the person we're looking at
    const getPerson = async () => {
        let person = await fetch(`${process.env.NEXTAUTH_URL}/api/people/${params.id}`,
            {
                headers: {
                    Cookie: lib.cookieObjectToString(cookies().getAll())
                }
            }
        )
        person = await person.json()
        return person.data.person
    }

    const person = await getPerson()

    return (
        <div className="column">
            <h1 className="title">Edit person</h1>
            {/* Create a form for this user and fill in existing data */}
            <Form
                method="PUT"
                action={`/api/people/${params.id}`}
                fields={[
                    {
                        name: 'fullName',
                        label: 'Full Name',
                        type: 'text',
                        value: person.fullName
                    },
                    {
                        name: 'shortName',
                        label: 'Short name',
                        type: 'text',
                        value: person.shortName
                    },
                    {
                        name: 'pronouns',
                        label: 'Pronouns',
                        type: 'PronounSelector',
                        value: person.pronouns.id
                    },
                    {
                        name: 'birthdate',
                        label: 'Date of birth',
                        type: 'date',
                        value: person.born ? new Date(person.born).toISOString().substring(0, 10) : null
                    },
                    {
                        name: 'deathdate',
                        label: 'Date of death',
                        type: 'date',
                        value: person.died ? new Date(person.died).toISOString().substring(0, 10) : null
                    }
                ]}
                acceptedFileTypes={[
                    "image/png",
                    "image/jpeg",
                    "image/gif"
                ]}
                allowMultipleFiles={false}
                requireFileUploadFirst={false}
                loadFilesFromUrl={true}
                fileIds={[person.profileImageId]}
            />
        </div>
    )
}

export default editPerson