"use client"

// Same deal as Record Deletion button

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import CollectionSelector from '../../../components/CollectionSelector/CollectionSelector'

/**
 * This is a helper button component for creating a new collection
 */

const CreateCollectionButton = () => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            onClick={() => modalFunctions.addModal(
                "Add new Collection",
                <form action="/api/collection" method="POST">
                    <formitem>
                        <label htmlFor='collectionName'>Collection Name</label>
                        <input type='text' id='collectionName' name='collectionName' />
                    </formitem>
                    <formitem>
                        <label htmlFor='collectionParentId' name='Parent Collection'>Parent Collection</label>
                        <CollectionSelector />
                    </formitem>
                    <formitem style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type='submit' value='Add' className="button" />
                        <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
                    </formitem>
                </form>
            )}
        >
            <span className="material-icons">library_add</span>
            New Collection
        </button>
    )
}

export default CreateCollectionButton