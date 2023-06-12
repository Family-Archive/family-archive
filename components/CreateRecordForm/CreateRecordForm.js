import styles from './CreateRecordForm.module.scss'
import PersonSelector from '../PersonSelector/PersonSelector'

const CreateRecordForm = (props) => {
    return (
        <form method="POST" action={`/api/record/${props.recordTypeData.type}`} className={styles.CreateRecordForm}>
            {props.recordTypeData.fields.map(field => {
                let Element
                switch (field.type) {
                    case "textarea":
                        Element = "textarea"
                        break
                    default:
                        Element = "input"
                }
                return <formitem>
                    <label htmlFor={field.name}>{field.name}</label>
                    <Element id={field.name} name={field.name} type={field.type} />
                </formitem>
            })}
            <PersonSelector />
            <input type="submit" className="button" value="Add Record" />
        </form>
    )
}

export default CreateRecordForm