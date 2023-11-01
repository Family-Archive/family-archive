import styles from './render.module.scss'
import clientLib from '@/lib/client/lib'

export function render(data) {
    data = JSON.parse(data)
    return <div className={styles.date}>
        <span className={`${styles.icon} material-icons`}>event</span>
        <b>{clientLib.renderDate(data.startdate, data.enddate, data.unit)}</b>
    </div>
}