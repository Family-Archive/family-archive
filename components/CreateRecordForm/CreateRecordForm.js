import styles from './CreateRecordForm.module.scss'
import fieldComponents from './FieldComponents.js'

const CreateRecordForm = (props) => {
    return (
        <form method="POST" action={`/api/record/${props.recordTypeData.type}`} className={styles.CreateRecordForm}>
            {props.recordTypeData.fields.map((field, index) => {
                let Element = "input"
                const inputTypes = [
                    'button',
                    'checkbox',
                    'color',
                    'date',
                    'datetime-local',
                    'email',
                    'file',
                    'hidden',
                    'image',
                    'month',
                    'number',
                    'password',
                    'radio',
                    'range',
                    'reset',
                    'search',
                    'submit',
                    'tel',
                    'text',
                    'time',
                    'url',
                    'week'
                ]

                // If first letter of field type is uppercase it is a component.
                // Otherwise, if field type isn't in list of input types, set Element to that value
                const firstLetter = Array.from(field.type)[0];
                if (firstLetter === firstLetter.toUpperCase()) {
                    Element = fieldComponents[field.type];
                } else if (!inputTypes.includes(field.type)) {
                    Element = field.type
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