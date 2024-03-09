"use client"

import styles from './UserSearch.module.scss'

const UserSearch = ({ searchUsers, users, type, updateActiveUsers }) => {

    return <div className={styles.UserSearch}>
        <input
            type='text'
            onKeyUp={e => searchUsers(e.target.value)}
            placeholder='Search users'
            id={type}
        />
        {users.length && document.activeElement.id === type ?
            <div className={styles.dropdown}>
                {users.map(user => {
                    return <span
                        key={user.id}
                        onClick={() => updateActiveUsers(user, type, 'add')}
                    >
                        {user.name}
                    </span>
                })}
            </div>
            : ""}
    </div>
}

export default UserSearch