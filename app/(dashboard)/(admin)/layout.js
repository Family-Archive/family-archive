import styles from './AdminLayout.module.scss'
import lib from '@/lib/lib';
import { redirect } from 'next/navigation';

const AdminLayout = async ({ children, params }) => {

    const subpage = children.props.childProp.segment
    const isAdmin = await lib.userIsAdmin()

    // We need to allow non-admins to view their own profile page,
    // but right now this allows them to manually visit the All Users page + other user's profiles as well.
    if (!isAdmin && subpage != 'users') {
        redirect('/')
    }

    return (
        <div className={`admin ${styles.AdminLayout}`}>

            {isAdmin ?
                <div className={styles.adminBar}>
                    {['users', 'authentication', 'mail'].map(label => {
                        return <a className={label === subpage ? styles.active : ""} href={`/${label}`}>{label}</a>
                    })}
                </div> : ""
            }

            <div className={styles.adminPage}>
                {children}
            </div>
        </div >
    )
}

export default AdminLayout
