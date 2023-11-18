"use client"

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import { ToastContext } from '@/app/(contexts)/ToastContext'

/**
 * This is a helper button component for renaming a collection
 * @param {string} id: The ID of the collection that should be renamed
 */

const RenameButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)
    const toastFunctions = useContext(ToastContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Rename collection",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <formitem>
                        <label for='name'>Name</label>
                        <input type="text" name='name' id='name' />
                    </formitem>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                const formData = new FormData()
                                const name = document.querySelector('#name').value
                                formData.append('name', name)
                                fetch(`/api/collection/${id}`, {
                                    method: "PUT",
                                    body: formData
                                })
                                    .then(response => response.json())
                                    .catch(error => toastFunctions.createToast("Internal server error"))
                                    .then(data => {
                                        if (data.status === 'success') {
                                            window.location = `/collection/${id}`
                                        } else {
                                            toastFunctions.createToast(data.message)
                                        }
                                    })
                            }}
                        >
                            Ok
                        </button>
                        <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                    </div>
                </div>
            )}
        >
            Rename collection...
        </button>
    )
}

export default RenameButton