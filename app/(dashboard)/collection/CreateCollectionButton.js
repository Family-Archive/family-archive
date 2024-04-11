"use client"

// Same deal as Record Deletion button

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import { ToastContext } from '@/app/(contexts)/ToastContext'
import CollectionSelector from '../../../components/CollectionSelector/CollectionSelector'

/**
 * This is a helper button component for creating a new collection
 */

const CreateCollectionButton = () => {
    const modalFunctions = useContext(ModalContext)
    const toastFunctions = useContext(ToastContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Add new Collection",
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className='formitem'>
                        <label htmlFor='collectionName'>Collection Name</label>
                        <input type='text' id='collectionName' name='collectionName' />
                    </div>
                    <div className='formitem'>
                        <label htmlFor='collectionParentId' name='Parent Collection'>Parent Collection</label>
                        <CollectionSelector />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                const formData = new FormData()
                                const name = document.querySelector('#collectionName').value
                                const parentId = document.querySelector('#collectionParentId').value
                                formData.append('collectionName', name)
                                formData.append('collectionParentId', parentId)
                                fetch(`/api/collection/`, {
                                    method: "POST",
                                    body: formData
                                })
                                    .then(response => response.json())
                                    .catch(error => toastFunctions.createToast("Internal server error"))
                                    .then(data => {
                                        if (data.status === 'success') {
                                            window.location.reload()
                                        } else {
                                            toastFunctions.createToast(data.message)
                                        }
                                    })
                            }}
                        >Add</button>
                        <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                    </div>
                </div >
            )}
        >
            <span className="material-icons">library_add</span>
            New Collection
        </button >
    )
}

export default CreateCollectionButton