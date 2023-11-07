"use client"
import { useEffect, useState } from 'react'
import styles from './usersPage.module.scss'

import Link from 'next/link'

/**
 * This page displays all of the users in the system
 */

const usersPage = () => {
    const [users, setpeople] = useState([])
    const [query, setquery] = useState("")

    // Since this is a client component, ask the API for the list of users when the component mounts
    useEffect(() => {
        const fetchPeople = async () => {
            let users = await fetch(`/api/users`)
            users = await users.json()
            setpeople(users.data.users)
        }
        fetchPeople()
    }, [])

    return (
        <div className={styles.usersPage}>
            <div className="topBar">
                <h1 className='title'>Users</h1>
                <div className='pageOptions'>
                    <Link href='/users/add'>
                        <button><span className="material-icons">person_add</span>Add user</button>
                    </Link>
                </div>
            </div>

            <div>
                <label htmlFor='peopleSearch'>Search users</label>
                <input
                    type='text'
                    name='peopleSearch'
                    id='peopleSearch'
                    autoComplete='false'
                    onKeyUp={e => setquery(e.target.value)}
                    placeholder='Start typing to filter list'
                />
            </div><br />
            <div className={styles.users}>
                {users.map(user => {
                    if (query.toLowerCase() && !user.name.toLowerCase().includes(query)) {
                        return
                    }

                    return <Link href={`/users/${user.id}`}>
                        <div className={styles.user}>
                            {user.name} / {user.email}
                        </div>
                    </Link>
                })}
            </div>
        </div>
    )
}

export default usersPage