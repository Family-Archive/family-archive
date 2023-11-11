import styles from './AdminLayout.module.scss'

import Link from 'next/link'

const AdminLayout = async ({ children }) => {
    // some logic here to make sure user can access page

    return (
        <div className={`admin ${styles.AdminLayout}`}>
            <div className={styles.adminBar}>
                <Link href='/users'>Users</Link>
                <Link href='/mail'>Mail</Link>
            </div>
            <div className={styles.adminPage}>
                {children}
            </div>
        </div >
    )
}

export default AdminLayout
