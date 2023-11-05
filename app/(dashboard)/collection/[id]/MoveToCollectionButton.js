"use client"

// This needs to be a separate component because it's client-side.
// Since it's bespoke, I'm just putting it here

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import CollectionSelector from '@/components/CollectionSelector/CollectionSelector'

/**
 * This is a helper button component for making an existing collection a child of another collection
 * @param {string} id: The ID of the collection that should be moved
 */

const MoveToCollectionButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Move to collection",
                <>
                    {/* Only the ID of the child is passed to this component, so how do we know what the parent is? */}
                    {/* This "CollectionSelector" component contains a form that provides this value */}
                    <CollectionSelector /><br />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                // Post to the collection api endpoint
                                const formData = new FormData()
                                const collectionId = document.querySelector('#collectionParentId').value || null
                                formData.append('parentId', collectionId)
                                fetch(`/api/collection/${id}`, {
                                    method: "PUT",
                                    body: formData
                                })
                                    .then(response => response.json())
                                    .then(data => { window.location = `/collection/${collectionId || ""}` })
                            }}
                        >
                            Ok
                        </button>
                        <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                    </div>
                </>
            )}
        >
            Move to parent collection...
        </button>
    )
}

export default MoveToCollectionButton