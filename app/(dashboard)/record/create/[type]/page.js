import CreateRecordForm from "@/components/CreateRecordForm/CreateRecordForm"

const createRecordType = async ({ params, searchParams }) => {
    let recordType
    let recordTypeData

    try {
        let recordTypeClass = await import(`recordtypes/${params.type}/record`)
        recordType = new recordTypeClass.default()
        recordTypeData = recordType.getStructure()
    } catch (error) {
        return (
            <div>
                Error: We couldn't find this record type.
            </div>
        )
    }

    return (
        <div>
            <div className="column">
                <h1 className='title'>Add {recordTypeData.name}</h1>
                <CreateRecordForm recordTypeData={recordTypeData} recordTypeClass={recordType} searchParams={searchParams} />
            </div>
        </div>
    )
}

export default createRecordType