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
const CollectionSelector = (props) => {
    const params = useParams()

    const [collections, setcollections] = useState([]) // List of collections we want to make selectable
    const [activeCollection, setactiveCollection] = useState(null) // The parent collection of the children we are currently looking at (if applicable)
    const [selectedCollection, setselectedCollection] = useState(null) // The actual, highlighted selection
    const [loading, setloading] = useState(true)
    const [isSearching, setisSearching] = useState(false)

    const getChildren = async (id = null) => {
        setloading(true)
        let collectionsData = await fetch(`/api/collection/${id ? id : ''}`)
        collectionsData = await collectionsData.json()
        setloading(false)

        if (collectionsData.data.collections[0] && collectionsData.data.collections[0].children !== undefined) {
            setcollections(collectionsData.data.collections[0].children)
            setactiveCollection(collectionsData.data.collections[0])
        } else {
            setcollections(collectionsData.data.collections)
            setactiveCollection(null)
        }
    }

    const getCollectionsFromRecordId = async () => {
        let collectionsData = await fetch(`/api/collection?recordId=${props.recordId}`)
        collectionsData = await collectionsData.json()
        setcollections(collectionsData.data.collections)
    }

    const searchCollections = async (name) => {
        let collectionsData = await fetch(`/api/collection?name=${name}`)
        collectionsData = await collectionsData.json()
        setactiveCollection(null)
        setselectedCollection(null)
        setcollections(collectionsData.data.collections)
    }

    useEffect(() => {
        // If we're currently in a collection already, when we click the "New Collection" button,
        // we want to have the collection we're in immediately selected. So we check if we have an id parameter in the path,
        // and if so, set it as the active and selected collection. But we actually want the active collection to be one level up,
        // so we also programmatically click the Back button :P
        const activateCurrentCollection = async () => {
            await getChildren(params.id ? params.id : null)
            if (params.id) {
                window.setTimeout(() => {
                    document.querySelector('#up').click()
                    setselectedCollection(params.id)
                }, 200)
            }
        }

        if (props.recordId) {
            getCollectionsFromRecordId(props.recordId)
        } else {
            activateCurrentCollection()
        }
    }, [])

    return (
        <div className={styles.CollectionSelector}>
            <input type='hidden' name="collectionParentId" id="collectionParentId" value={selectedCollection ? selectedCollection : ""} />

            {loading ? <span className={styles.loading}>Loading...</span>
                : <>
                    <div className={styles.formControl}>
                        {!props.recordId ?
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
                            {isSearching || props.recordId ? "" :
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