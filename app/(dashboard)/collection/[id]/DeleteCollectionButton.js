"use client"

// This needs to be a separate component because it's client-side.
// Since it's bespoke, I'm just putting it here

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'

/**
 * This is a helper button component for deleting collections
 * @param {string} id: The ID of the collection to delete
 */

const DeleteButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            className="delete"
            onClick={() => modalFunctions.addModal(
                "Are you sure?",
                <>
                    <p>Are you sure you want to delete this collection?</p>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => fetch(`/api/collection/${id}`, { method: "DELETE" })
                                .then(response => response.json())
                                .then(data => { window.location = '/collection' })
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
            Delete collection
        </button>
    )
}

export default DeleteButton