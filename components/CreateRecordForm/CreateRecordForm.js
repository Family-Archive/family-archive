import styles from './CreateRecordForm.module.scss'
import fieldComponents from './FieldComponents.js'

const CreateRecordForm = (props) => {
    return (
        <form method="POST" action={`/api/record/${props.recordTypeData.type}`} className={styles.CreateRecordForm}>
            {props.recordTypeData.fields.map((field, index) => {
                let Element

                // If first letter of field type is uppercase it is a component.
                const firstLetter = Array.from(field.type)[0];
                if (firstLetter === firstLetter.toUpperCase()) {
                    Element = fieldComponents[field.type];
                } else {
                    switch (field.type) {
                        case "textarea":
                            Element = "textarea"
                            break
                        default:
                            Element = "input"
                    }
                }
                return <formitem key={index}>
                    <label htmlFor={field.name}>{field.name}</label>
                    <Element id={field.name} name={field.name} type={field.type} />
                </formitem>
            })}
            <input type="submit" className="button" value="Add Record" />
        </form>
    )
}

export default CreateRecordForm