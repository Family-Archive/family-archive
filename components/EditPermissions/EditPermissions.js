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

    const { data: session, status } = useSession()

    useEffect(() => {
        getPermissions('read')
        getPermissions('edit')
    }, [])

    const getPermissions = async (type) => {
        let permissions = await fetch(`/api/permissions?resourceType=${resourceType}&resourceId=${resourceId}&permission=${type}&userId=${session.user.id}`)
        permissions = await permissions.json()

        let users = []
        for (let permission of permissions.data.permissions) {
            users.push(permission.user)
        }

        if (type === 'read') {
            setactiveUsersRead(users)
        } else {
            setactiveUsersEdit(users)
        }
    }

    const searchUsers = async query => {
        let users = []
        if (query) {
            users = await fetch(`/api/users?search=${query}`)
            users = await users.json()
            users = users.data.users
        }

        setuserResults(users)
    }

    const updateActiveUsers = (user, type, action) => {
        if (action === 'add') {
            if (type === 'read') {
                setactiveUsersRead([...activeUsersRead, user])
            } else {
                setactiveUsersEdit([...activeUsersEdit, user])
            }
        } else {
            if (type === 'read') {
                setactiveUsersRead(activeUsersRead.filter(item => item !== user))
            } else {
                setactiveUsersEdit(activeUsersEdit.filter(item => item !== user))
            }
        }
    }

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
                    {activeUsersRead.length ? activeUsersRead.map(user => {
                        return <div key={user.id} className={styles.user}>
                            <span>{user.name}</span>
                            <button
                                onClick={() => updateActiveUsers(user, 'read', 'remove')}
                            >
                                del
                            </button>
                        </div>
                    }) : <span>
                        No permissions specified!<br />
                        Anyone can view this item.
                    </span>}
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
                    {activeUsersEdit.length ? activeUsersEdit.map(user => {
                        return <div key={user.id} className={styles.user}>
                            <span>{user.name}</span>
                            <button
                                onClick={() => updateActiveUsers(user, 'edit', 'remove')}
                            >
                                del
                            </button>
                        </div>
                    }) : <span>
                        No permissions specified!<br />
                        Only the creator can edit this item.
                    </span>}
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