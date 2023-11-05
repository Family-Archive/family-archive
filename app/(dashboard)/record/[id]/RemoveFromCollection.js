"use client"

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import CollectionSelector from '@/components/CollectionSelector/CollectionSelector'

/**
 * A helper button component for removing a record from a collection
 * @param {string} id: The ID of the record
 */

const RemoveFromCollectionButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Remove from collection",
                <>
                    {/* Once again, we only pass to this component the ID of the record */}
                    {/* The collection ID comes from this component here*/}
                    <CollectionSelector recordId={id} /><br />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                const collectionId = document.querySelector('#collectionParentId').value
                                fetch(`/api/record/${id}/collection/${collectionId}`, {
                                    method: "DELETE",
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