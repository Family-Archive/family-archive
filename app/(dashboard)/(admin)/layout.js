import styles from './AdminLayout.module.scss'
import permissionLib from '@/lib/permissions/lib';
import { redirect } from 'next/navigation';

const AdminLayout = async ({ children, params }) => {

    const subpage = children.props.childProp.segment
    const isAdmin = await permissionLib.userIsAdmin()

    // We need to allow non-admins to view their own profile page,
    // but right now this allows them to manually visit the All Users page + other user's profiles as well.
    if (!isAdmin && subpage != 'users') {
        redirect('/')
    }

    return (
        <div className={`admin ${styles.AdminLayout}`}>

            {isAdmin ?
                <div className={styles.adminBar}>
                    {['users', 'families', 'authentication', 'mail'].map(label => {
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
