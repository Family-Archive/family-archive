"use client"

import styles from './CollectionSelector.module.scss'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

/**
 * This component allows a user to select a Collection. It's basically a form component that should be inserted in a parent form
 * It allows the user to search for collections as well as browse them like a filesystem
 * 
 * Optional prop: {string} recordId: If a recordId is passed, the component will disable the search bar 
 * and only show collections of which the record belongs
 */
const CollectionSelector = ({ recordId }) => {
    const params = useParams()

    const [collections, setcollections] = useState([]) // List of collections we want to make selectable
    const [activeCollection, setactiveCollection] = useState(null) // The parent collection of the children we are currently looking at (if applicable)
    const [selectedCollection, setselectedCollection] = useState(null) // The actual, highlighted selection
    const [loading, setloading] = useState(true) // If we're currently waiting for an API call to finish
    const [isSearching, setisSearching] = useState(false) // If the user is searching for collections

    /**
     * Get child collections of a parent if an ID was passed -- otherwise, get top-level collections
     * @param {string} id: The optional ID of the parent collection we want children of
     */
    const getChildren = async (id = null) => {
        setloading(true)
        let collectionsData = await fetch(`/api/collection/${id || ''}`)
        collectionsData = await collectionsData.json()
        setloading(false)

        if (collectionsData.data.collection && collectionsData.data.collection.children !== undefined) {
            setcollections(collectionsData.data.collection.children)
            setactiveCollection(collectionsData.data.collection)
        } else {
            setcollections(collectionsData.data.collections)
            setactiveCollection(null)
        }
    }

    /**
     * Fetch collections that own a record ID, passed via prop
     */
    const getCollectionsFromRecordId = async () => {
        let collectionsData = await fetch(`/api/collection?recordId=${recordId}`)
        collectionsData = await collectionsData.json()
        setcollections(collectionsData.data.collections)
        setloading(false)
    }

    /**
     * Given a query, search all collections that match
     * @param {string} name
     */
    const searchCollections = async (name) => {
        let collectionsData = await fetch(`/api/collection?name=${name}`)
        collectionsData = await collectionsData.json()
        setactiveCollection(null)
        setselectedCollection(null)
        setcollections(collectionsData.data.collection)
    }

    useEffect(() => {
        // If we're currently in a collection already, when we click the "New Collection" button,
        // we want to have the collection we're in immediately selected. So we check if we have an id parameter in the path,
        // and if so, set it as the active and selected collection. But we actually want the active collection to be one level up,
        // so we also programmatically click the Back button :P
        const activateCurrentCollection = async () => {
            const route = window.location.pathname.split('/').slice(-2)[0]
            if (params.id && route === 'collection') {
                await getChildren(params.id)
                window.setTimeout(() => {
                    document.querySelector('#up').click()
                    setselectedCollection(params.id)
                }, 200)
            } else {
                getChildren()
            }
        }

        if (recordId) {
            getCollectionsFromRecordId(recordId)
        } else {
            activateCurrentCollection()
        }
    }, [])

    return (
        <div className={styles.CollectionSelector}>
            <input type='hidden' name="collectionParentId" id="collectionParentId" value={selectedCollection || ""} />

            {loading ? <span className={styles.loading}>Loading...</span>
                : <>
                    <div className={styles.formControl}>
                        {!recordId ?
                            <input
                                type='text'
                                id='collectionSearch'
                                className={styles.collectionSearch}
                                placeholder='Search collections...'
                                onChange={(e) => {
                                    if (e.target.value == "") {
                                        setisSearching(false)
                                    } else {
                                        setisSearching(true)
                                    }
                                    searchCollections(e.target.value)
                                }}
                            ></input>
                            : ""}
                        {activeCollection ?
                            <a
                                href="#"
                                id='up'
                                className={`${styles.up} button`}
                                onClick={() => { getChildren(activeCollection.parentId); setactiveCollection(activeCollection.parentId) }}
                            >
                                <span className='material-icons' style={{ transform: 'rotate(90deg)' }}>subdirectory_arrow_left</span>Back
                            </a>
                            : ""
                        }
                    </div>


                    {collections.map(collection => {
                        return <a
                            href="#"
                            className={`
                            ${styles.singleCollection}
                            ${selectedCollection === collection.id ? styles.active : ""}
                        `}
                            onClick={(e) => {
                                if (!e.target.classList.contains('levelDown')) {
                                    selectedCollection === collection.id ? setselectedCollection(null) : setselectedCollection(collection.id)
                                }
                            }
                            }
                            key={collection.id}
                        >
                            {collection.name}
                            {isSearching || recordId ? "" :
                                <span
                                    className="material-icons levelDown"
                                    onClick={(e) => { getChildren(collection.id) }}
                                >
                                    subdirectory_arrow_right
                                </span>
                            }
                        </a>
                    })}
                </>}
        </div>
    )
}

export default CollectionSelector