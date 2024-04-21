import Form from "@/components/Form/Form"
import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib'
import * as personLib from '../lib'

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
    const spouseId = personLib.findSpouseId(person)

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
                        value: person.fullName,
                        required: true,
                    },
                    {
                        name: 'shortName',
                        label: 'Short name',
                        type: 'text',
                        value: person.shortName,
                        required: true,
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
                    },
                    {
                        name: 'parents',
                        label: 'Parents',
                        type: 'PersonSelector',
                        value: JSON.stringify(person.parents.map(p => p.id))
                    },
                    {
                        name: 'children',
                        label: 'Children',
                        type: 'PersonSelector',
                        value: JSON.stringify(person.children.map(c => c.id))
                    },
                    {
                        name: 'spouse',
                        label: 'Spouse',
                        type: 'PersonSelector',
                        value: JSON.stringify(spouseId ? [spouseId] : [])
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
                fileIds={[person?.profileImageId]}
                editMode={true}
                redirectTo={`/people/${person.id}`}
            />
        </div>
    )
}

export default editPerson
