"use client"

import styles from './EditPermissions.module.scss'
import { useEffect, useState, useContext } from 'react'
import { useSession } from "next-auth/react"
import { ModalContext } from '@/app/(contexts)/ModalContext'
import { ToastContext } from '@/app/(contexts)/ToastContext'
import UserSearch from './UserSearch/UserSearch'

const EditPermissions = ({ resourceId, resourceType }) => {
    const modalFunctions = useContext(ModalContext)
    const toastFunctions = useContext(ToastContext)

    const [activeUsersRead, setactiveUsersRead] = useState([])
    const [activeUsersEdit, setactiveUsersEdit] = useState([])
    const [userResults, setuserResults] = useState([])
    const [loading, setloading] = useState(false)

    const { data: session, status } = useSession()

    useEffect(() => {
        getPermissions('read')
        getPermissions('edit')
    }, [])

    /**
     * Get a list of current permissions for a resource
     * @param {string} permission: read|edit
     */
    const getPermissions = async (permission) => {
        setloading(true)
        let permissions = await fetch(`/api/permissions?resourceType=${resourceType}&resourceId=${resourceId}&permission=${permission}&userId=${session.user.id}`)
        permissions = await permissions.json()

        // The permission API returns the joined User object for each row;
        // we're mostly concerned with users in this component so we pull that information out
        let users = []
        for (let permission of permissions.data.permissions) {
            users.push(permission.user)
        }

        if (permission === 'read') {
            setactiveUsersRead(users)
        } else {
            setactiveUsersEdit(users)
        }

        setloading(false)
    }

    /**
     * Search all users for matching names
     * @param {string} query: The name to search
     */
    const searchUsers = async query => {
        let users = []
        if (query) {
            users = await fetch(`/api/users?search=${query}`)
            users = await users.json()
            users = users.data.users
        }

        setuserResults(users)
    }

    /**
     * Add or remove a user to the current permission sets tracked by this component
     * @param {object} user: The User object from Prisma
     * @param {string} permission: read|edit
     * @param {string} action add|remove
     */
    const updateActiveUsers = (user, permission, action) => {
        if (action === 'add') {
            if (permission === 'read') {
                setactiveUsersRead([...activeUsersRead, user])
            } else {
                setactiveUsersEdit([...activeUsersEdit, user])
            }
        } else {
            if (permission === 'read') {
                setactiveUsersRead(activeUsersRead.filter(item => item !== user))
            } else {
                setactiveUsersEdit(activeUsersEdit.filter(item => item !== user))
            }
        }
    }

    /**
     * Commit the current proposed permissions to the database
     * @param {string} permission read|edit
     * @param {boolean} redirect: If the page should refresh after the function returns
     */
    const savePermissions = async (permission, redirect = false) => {
        const formData = new FormData()
        formData.append('resourceId', resourceId)
        formData.append('resourceType', resourceType)
        formData.append('permission', permission)

        if (permission === 'read') {
            formData.append('users', JSON.stringify(activeUsersRead.map(user => { return { id: user.id, type: 'user' } })))
        } else {
            formData.append('users', JSON.stringify(activeUsersEdit.map(user => { return { id: user.id, type: 'user' } })))
        }

        await fetch(`/api/permissions/`, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .catch(error => { console.log(error); toastFunctions.createToast("Internal server error") })
            .then(data => {
                if (data.status === 'success') {
                    if (redirect) {
                        window.location.reload()
                    }
                } else {
                    toastFunctions.createToast(data.message)
                }
            })
    }

    return <div className={styles.EditPermissions}>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <div className={styles.permissions}>
                <span>Limit read access to...</span>
                <UserSearch
                    type='read'
                    searchUsers={searchUsers}
                    users={userResults}
                    updateActiveUsers={updateActiveUsers}
                />
                <div className={styles.activeUsers}>
                    {loading ?
                        <span>Loading...</span>
                        : activeUsersRead.length ? activeUsersRead.map(user => {
                            return <div key={user.id} className={styles.user}>
                                <span>{user.name}</span>
                                <button
                                    onClick={() => updateActiveUsers(user, 'read', 'remove')}
                                >
                                    <span className="material-icons">remove_circle</span>
                                </button>
                            </div>
                        }) : <span>
                            No permissions specified!<br />
                            Anyone can view this item.
                        </span>
                    }
                </div>
            </div>

            <div className={styles.permissions}>
                <span>Allow edit access to...</span>
                <UserSearch
                    type='edit'
                    searchUsers={searchUsers}
                    users={userResults}
                    updateActiveUsers={updateActiveUsers}
                />
                <div className={styles.activeUsers}>
                    {loading ?
                        <span>Loading...</span>
                        : activeUsersEdit.length ? activeUsersEdit.map(user => {
                            return <div key={user.id} className={styles.user}>
                                <span>{user.name}</span>
                                <button
                                    onClick={() => updateActiveUsers(user, 'edit', 'remove')}
                                >
                                    <span className="material-icons">remove_circle</span>
                                </button>
                            </div>
                        }) : <span>
                            No permissions specified!<br />
                            Only the creator can edit this item.
                        </span>
                    }
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
                onClick={async () => { await savePermissions('read'); await savePermissions('edit', true) }}
            >
                Save
            </button>
            <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
        </div>
    </div>
}

export default EditPermissions