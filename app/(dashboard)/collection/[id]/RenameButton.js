"use client"

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'

const RenameButton = (props) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Rename collection",
                <>
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
                                fetch(`/api/collection/${props.id}`, {
                                    method: "PUT",
                                    body: formData
                                })
                                    .then(response => response.json())
                                    .then(data => { window.location = `/collection/${props.id}` })
                            }}
                        >
                            Ok
                        </button>
                        <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                    </div>
                </>
            )}
        >
            Rename collection...
        </button>
    )
}

export default RenameButton