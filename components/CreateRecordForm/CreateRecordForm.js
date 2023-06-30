import Form from '../Form/Form'

const CreateRecordForm = (props) => {
    const acceptedFileTypes = ['image/jpeg']

    return (
        <Form
            method="POST"
            action={`/api/record/${props.recordTypeData.type}`}
            fields={props.recordTypeData.fields}
            acceptedFileTypes={acceptedFileTypes}
            allowMultipleFiles={false}
        />
    )
}

export default CreateRecordForm