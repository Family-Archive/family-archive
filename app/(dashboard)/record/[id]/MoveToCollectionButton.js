"use client"

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import CollectionSelector from '@/components/CollectionSelector/CollectionSelector'

/**
 * This is a helper button component for adding a record to a collection
 * @param {string} id: The ID of the record 
 * @returns 
 */

const MoveToCollectionButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Add to collection",
                <>
                    <CollectionSelector /><br />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => {
                                const collectionId = document.querySelector('#collectionParentId').value
                                fetch(`/api/record/${id}/collection/${collectionId}`, {
                                    method: "POST"
                                })
                                    .then(response => response.json())
                                    .then(data => { window.location = `/collection/${collectionId}` })
                            }
                            }
                        >
                            Ok
                        </button>
                        <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                    </div>
                </>
            )}
        >
            Add to collection...
        </button>
    )
}

export default MoveToCollectionButton