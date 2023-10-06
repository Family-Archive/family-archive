"use client"

// This needs to be a separate component because it's client-side.
// Since it's bespoke, I'm just putting it here

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import CollectionSelector from '@/components/CollectionSelector/CollectionSelector'

const MoveToCollectionButton = (props) => {
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
                                fetch(`/api/record/${props.id}/collection/${collectionId}`, {
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