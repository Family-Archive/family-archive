import Form from '../Form/Form'

const EditRecordForm = ({ recordTypeData, recordData }) => {
    const recordTypeOptions = recordTypeData.config.options
    const acceptedFileTypes = recordTypeOptions.acceptedFileTypes
    let fields = recordTypeData.fields

    const addValuesToFields = () => {
        let updatedFields = []

        for (let field of fields) {
            let updatedField = structuredClone(field)

            // If this is a default field, set its value on the updated field.
            if (recordData.data.record[field.name.toLowerCase()]) {
                updatedField.value = recordData.data.record[field.name.toLowerCase()]
            }

            // If this is an additional field, check if it has a value
            // and then set its value on the updated field.
            else {
                let fieldObject = recordData.data.fields.find(element => element.name == field.name)
                if (fieldObject) {
                    updatedField.value = fieldObject.value
                }
            }

            updatedFields.push(updatedField)
        }

        return updatedFields
    }

    return (
        <Form
            method="POST"
            action={`/api/record/type/${recordTypeData.type}`}
            fields={addValuesToFields()}
            acceptedFileTypes={acceptedFileTypes}
            allowMultipleFiles={recordTypeOptions.allowMultipleFiles}
        />
    )
}

export default EditRecordForm