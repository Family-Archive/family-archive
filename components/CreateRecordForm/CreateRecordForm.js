import Form from '../Form/Form'

const CreateRecordForm = (props) => {
    const acceptedFileTypes = ['*']

    return (
        <Form
            method="POST"
            action={`/api/record/type/${props.recordTypeData.type}`}
            fields={props.recordTypeData.fields}
            acceptedFileTypes={acceptedFileTypes}
            allowMultipleFiles={false}
        />
    )
}

export default CreateRecordForm