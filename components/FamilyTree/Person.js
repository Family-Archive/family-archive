import styles from './Person.module.scss'
import Link from 'next/link'

const Person = ({id, fullName, born, died, image}) => {
    const formatBirthDate = (date) => {
        if (!date) {
            return ''
        }

        return `b. ${date.toLocaleDateString()}`
        // return `b. ${date.getMonth()} ${date.getDay()}, ${date.getFullYear()}`
    }

    return (
        <Link href={`/people/${id}`}>
            <div className={styles.person}>
            <img src={`/api/file/${image}`} />
            <div className={styles.nameContainer}>{fullName.split(' ').map(name => {
                return (
                    <div>{name}</div>
                )
            })}</div>
            <div className={styles.birthDate}>{formatBirthDate(born)}</div>
            </div>
        </Link>
    )
}

export default Person
