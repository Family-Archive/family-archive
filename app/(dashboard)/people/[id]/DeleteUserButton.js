"use client"

import { ModalContext } from '@/app/(contexts)/ModalContext'
import { useContext } from 'react'

/**
 * This is a helper button component for deleting a user
 * @param {string} id: The ID of the user that should be deleted
 */

const DeleteUserButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)

    return <button
        className="delete"
        onClick={() => modalFunctions.addModal(
            "Are you sure?",
            <>
                <p>Are you sure you want to delete this person?</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => fetch(`/api/people/${id}`, { method: "DELETE" })
                            .then(response => response.json())
                            .then(data => { window.location = '/people' })
                        }
                    >
                        Yes
                    </button>
                    <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                </div>
            </>
        )}
    >
        {/* <span className="material-icons">delete_forever</span> */}
        Delete person
    </button>
}

export default DeleteUserButton