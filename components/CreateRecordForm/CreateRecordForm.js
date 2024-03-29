import Form from '../Form/Form'

/**
 * Wrapper component for creating a record
 */

const CreateRecordForm = async (props) => {
    const recordType = props.recordTypeClass
    const recordTypeData = recordType.getStructure()
    const recordTypeOptions = props.recordTypeData.config.options
    const acceptedFileTypes = recordTypeOptions.acceptedFileTypes

    return (
        <Form
            method="POST"
            action={`/api/record/type/${recordTypeData.type}`}
            fields={recordTypeData.fields}
            acceptedFileTypes={acceptedFileTypes}
            allowMultipleFiles={recordTypeOptions.allowMultipleFiles}
            requireFileUploadFirst={recordTypeOptions.requireFileUploadFirst}
            recordType={recordType.name}
            loadFilesFromUrl={true}
        />
    )
}

export default CreateRecordForm
