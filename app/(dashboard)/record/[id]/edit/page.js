import EditRecordForm from "@/components/EditRecordForm/EditRecordForm"
import lib from '@/lib/lib'
import { cookies } from 'next/dist/client/components/headers'

/**
 * This page displays a form for editing existing records
 */

const EditRecord = async ({ params }) => {
    // Fetch the stored data for this record.
    let recordData = await fetch(`${process.env.NEXTAUTH_URL}/api/record/${params.id}`, {
        headers: {
            Cookie: lib.cookieObjectToString(cookies().getAll())
        }
    })
    recordData = await recordData.json()

    // Fetch the data for how this record type is configured.
    let recordTypeData = await fetch(`${process.env.NEXTAUTH_URL}/api/record/type/${recordData.data.record.type}`)
    recordTypeData = await recordTypeData.json()

    return (
        <>
            <h1 className='title'>Edit {recordData.data.record.name}</h1>
            <EditRecordForm
                recordTypeData={recordTypeData}
                recordData={recordData}
            />
        </>
    )
}

export default EditRecord