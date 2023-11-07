import styles from './userView.module.scss'

import { cookies } from 'next/dist/client/components/headers'
import lib from '@/lib/lib'
import clientLib from '@/lib/client/lib'
import Link from 'next/link'
import Dropdown from '@/components/Dropdown/Dropdown'
import BreadcrumbTrail from '@/components/BreadcrumbTrail/BreadcrumbTrail'
// import DeleteUserButton from './DeleteUserButton'

/**
 * This page displays information relating to a user
 */

const userView = async ({ params }) => {
    // Get the data for the user
    const getuser = async () => {
        let user = await fetch(`${process.env.NEXTAUTH_URL}/api/users/${params.id}`,
            {
                headers: {
                    Cookie: lib.cookieObjectToString(cookies().getAll())
                }
            }
        )
        user = await user.json()
        return user.data.user
    }

    const user = await getuser()
    console.log(user)

    return (
        <div className={`${styles.userView} column`}>
            <div className="topBar">
                <h1 className='title'>{user.name}</h1>
                <div className='pageOptions'>
                    <Link href={`/users/${params.id}/edit${user.profileImageId ? `?files=${user.profileImageId}` : ""}`}>
                        <button><span className="material-icons">edit</span>Edit user</button>
                    </Link>
                    {/* <Dropdown
                        title="Options"
                        options={[
                            <DeleteUserButton id={user.id} />
                        ]}
                    /> */}
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                <div>
                    <div className={styles.info}>
                        <span><b>Name</b>{user.name}</span>
                        <span><b>Email</b>{user.email}</span>
                    </div>
                    <div className={styles.accounts}>
                        <h2>Connected authentication methods</h2>
                        {user.accounts.map(account => {
                            return <div className={styles.account}>
                                <span className={styles.accountId}>{account.id}</span>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{account.type}</span>
                                    <div>
                                        <img src={`/icons/logos/${account.provider}.svg`} />
                                        <span>{account.provider}</span>
                                    </div>
                                </div>
                            </div>
                        })}
                    </div>
                </div>
                <div className={styles.extraInfo}>
                    <h2>More details</h2>
                    <span><b>Families</b>{user.families.map(family => { return `${family.name}, ` })}</span>
                    <span><b>Default Family</b>{user.defaultFamilyId}</span>
                    <span><b>Email verified?</b>{user.emailVerified || 'No'}</span>
                </div>
            </div>

        </div>
    )
}

export default userView