"use client"

import styles from './CollectionSelector.module.scss'
import { useEffect, useState } from 'react'

const CollectionSelector = (props) => {
    // Optional prop "recordId" -- takes a record ID with which to show only collections the record is currently in

    const [collections, setcollections] = useState([]) // List of collections we want to make selectable
    const [activeCollection, setactiveCollection] = useState(null) // The parent collection of the children we are currently looking at (if applicable)
    const [selectedCollection, setselectedCollection] = useState(null) // The actual, highlighted selection
    const [isSearching, setisSearching] = useState(false)

    const getChildren = async (id = null) => {
        let collectionsData = await fetch(`/api/collection/${id ? id : ''}`)
        collectionsData = await collectionsData.json()

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
        if (props.recordId) {
            getCollectionsFromRecordId(props.recordId)
        } else {
            getChildren()
        }
    }, [])

    return (
        <div className={styles.CollectionSelector}>
            <input type='hidden' name="collectionParentId" id="collectionParentId" value={selectedCollection ? selectedCollection : ""} />

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
        </div>
    )
}

export default CollectionSelector