import styles from './render.module.scss'

export function render(data) {
    data = JSON.parse(data)
    return <div className={styles.location}>
        <span className={`${styles.icon} material-icons`}>location_on</span>
        <b>{data.name ? data.name :
            <span>{data.lat}<br />{data.lng}</span>
        }</b>
    </div>
}