"use client"

// This needs to be a separate component because it's client-side.
// Since it's bespoke, I'm just putting it here

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import CollectionSelector from '@/components/CollectionSelector/CollectionSelector'

const RemoveFromCollectionButton = (props) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Remove from collection",
                <>
                    <CollectionSelector recordId={props.id} /><br />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                const formData = new FormData()
                                const collectionId = document.querySelector('#collectionParentId').value
                                formData.append('collections', JSON.stringify({
                                    value: collectionId,
                                    disconnect: true,
                                    name: "collections",
                                }))
                                fetch(`/api/record/${props.id}`, {
                                    method: "PUT",
                                    body: formData
                                })
                                    .then(response => response.json())
                                    .then(data => { window.location.reload() })
                            }}
                        >
                            Ok
                        </button>
                        <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                    </div>
                </>
            )}
        >
            Remove from collection...
        </button>
    )
}

export default RemoveFromCollectionButton