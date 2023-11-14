import { headers } from 'next/headers';
import styles from './AdminLayout.module.scss'

const AdminLayout = async ({ children }) => {

    // some logic here to make sure user can access page

    const subpage = children.props.childProp.segment

    return (
        <div className={`admin ${styles.AdminLayout}`}>
            <div className={styles.adminBar}>
                {['users', 'authentication', 'mail'].map(label => {
                    return <a className={label === subpage ? styles.active : ""} href={`/${label}`}>{label}</a>
                })}
            </div>
            <div className={styles.adminPage}>
                {children}
            </div>
        </div >
    )
}

export default AdminLayout
