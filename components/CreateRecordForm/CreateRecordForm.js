import Form from '../Form/Form'
import lib from './lib'

const CreateRecordForm = async (props) => {
    const recordType = props.recordTypeClass
    const recordTypeData = recordType.getStructure()
    const recordTypeOptions = props.recordTypeData.config.options
    const acceptedFileTypes = recordTypeOptions.acceptedFileTypes
    const initialFiles = await lib.getFileFromUrlParam(props.searchParams)

    return (
        <Form
            method="POST"
            action={`/api/record/${recordTypeData.type}`}
            fields={recordTypeData.fields}
            initialFiles={initialFiles}
            acceptedFileTypes={acceptedFileTypes}
            allowMultipleFiles={recordTypeOptions.allowMultipleFiles}
            requireFileUploadFirst={recordTypeOptions.requireFileUploadFirst}
            recordType={recordType.name}
        />
    )
}

export default CreateRecordForm
