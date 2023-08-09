import Form from '../Form/Form'

const CreateRecordForm = (props) => {
    const recordTypeOptions = props.recordTypeData.config.options
    const acceptedFileTypes = recordTypeOptions.acceptedFileTypes

    return (
        <Form
            method="POST"
            action={`/api/record/${props.recordTypeData.type}`}
            fields={props.recordTypeData.fields}
            acceptedFileTypes={acceptedFileTypes}
            allowMultipleFiles={recordTypeOptions.allowMultipleFiles}
        />
    )
}

export default CreateRecordForm