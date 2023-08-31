import CreateRecordForm from "@/components/CreateRecordForm/CreateRecordForm"

const createRecordType = async ({ params }) => {
    let recordTypeData = await fetch(`${process.env.NEXTAUTH_URL}/api/record/type/${params.type}`)
    recordTypeData = await recordTypeData.json()

    return (
        <div>
            <div className="column">
                <h1 className='title'>Add {recordTypeData.name}</h1>
                <CreateRecordForm recordTypeData={recordTypeData} />
            </div>
        </div>
    )
}

export default createRecordType