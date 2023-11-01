import styles from './render.module.scss'

export function render(data) {
    data = JSON.parse(data)
    return <div className={styles.people}>
        <span className={`${styles.icon} material-icons`}>boy</span>
        {data.map(person => {
            return <button key={person} className={styles.person}>
                {person}
            </button>
        })}
    </div>
}