"use client"

import { useState, useRef, useEffect } from 'react'
import styles from './TextSearchInput.module.scss'

/**
 * This component is a generic text box that allows a user to search data
 * Matching records will be shown in a dropdown and can be selected
 * 
 * When implemented, the component must take a searchFunction, a function that takes a query argument
 * and returns a list of objects like {name: "some label to show", data: {anything else to attach to the value}}
 * 
 * The component can also take a runOnUpdate function that will run any arbitrary code when the list of selected items is updated
 * This function must take an argument activeItems, a list of all the selected items
 * 
 * You can also pass initial data to load into the component on page load, a custom label or placeholder, and whether or not to
 * visually show the selected objects in the UI
 */

const TextSearchInput = ({
    runOnUpdate = activeItems => { },
    canonicalData = [],
    searchFunction,
    label = "",
    placeholder = "Start typing to see suggestions",
    showChips = true
}) => {
    const [searchResults, setsearchResults] = useState([])
    // If a promise was passed as canonical/initial data, set it to an empty array for the time being and we'll deal with it later
    const [activeItems, setactiveItems] = useState(canonicalData?.then ? [] : canonicalData)
    const [highlightedItem, sethighlightedItem] = useState(-1)

    /**
     * This function runs every time the input is updated
     * It runs the passed searchFunction function with some extra checks
     * @param {string} query: The query passed to the searchFunction
     * @returns {Array}: If the searchFunction is implemented correctly, we get a list of objects like {name: "some_string", data: {some: data}}
     */
    const onSearch = async (query) => {
        if (!query) {
            setsearchResults([])
            return
        }

        // make sure search results aren't already in active item list
        let results = await searchFunction(query)
        let searchArray = []
        for (let result of results) {
            if (!checkItemIsActive(result)) {
                searchArray.push(result)
            }
        }
        setsearchResults(searchArray)
    }

    /**
     * Given an object, check if it's already in the activeItem list
     * @param {Object} item 
     * @returns {Boolean}
     */
    const checkItemIsActive = item => {
        for (let activeItem of activeItems) {
            if (item.name === activeItem.name) {
                return true
            }
        }
        return false
    }

    /**
     * Remove an item from the list of active items
     * @param {Object} item 
     */
    const removeItem = item => {
        let newArray = []
        for (let activeItem of activeItems) {
            if (activeItem.name != item.name) {
                newArray.push(activeItem)
            }
        }
        setactiveItems(newArray)
    }

    // Run the passed onUpdate function when activeItems changes
    // The function must take a list of active items as an arg
    useEffect(() => {
        runOnUpdate(activeItems)
        setsearchResults([])
    }, [activeItems])

    // If the search menu closes, reset the highlighted item counter
    useEffect(() => {
        if (!searchResults.length) {
            sethighlightedItem(-1)
        }
    }, [searchResults])

    // If the highlighted item changes to a value other than -1, focus that item in the list
    useEffect(() => {
        if (highlightedItem !== -1) {
            document.querySelector('.searchResults').children[highlightedItem].focus()
        }
    }, [highlightedItem])

    // If the user clicks outside the component, close the menu
    const ref = useRef();
    const handleClickOutside = e => {
        if (!ref.current.contains(e.target)) {
            setsearchResults([])
        }
    }
    useEffect(() => {
        // If a promise was passed as initial data, wait for it to resolve and then set the active items :3
        if (typeof canonicalData?.then === 'function') {
            canonicalData.then(value => {
                setactiveItems(value)
            })
        }

        // When the component mounts, add the listener for the outside click to the window
        // Remove it when the component unmounts
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // The canonicalData value allows you to control the state of the child from any parent
    // It can be used simply to pass an initial value to the field, but the parent can also track the state of the text field
    // at a higher level by leveraging the runOnUpdate function, and then passing that state into the canonicalData field
    // then when the state on the parent updates, it updates on the child, and vice-versa
    // see the PersonSelector for an example of all this
    useEffect(() => {
        if (
            typeof canonicalData?.then !== 'function'
            && typeof canonicalData === 'object'
            && canonicalData.length > 0
        ) {
            setactiveItems(canonicalData)
        }
    }, [canonicalData])

    return <div
        ref={ref}
        className={`
            textSearchInput
            ${styles.TextSearchInput}
            ${searchResults.length ? styles.hasResults : ""}
        `}
        onKeyDown={e => {
            if (e.key == 'ArrowUp') {
                if (highlightedItem === 0) {
                    sethighlightedItem(-1)
                    e.target.closest('div').parentElement.querySelector('input').focus()
                } else if (highlightedItem > 0) {
                    sethighlightedItem(Math.max(0, highlightedItem - 1))
                }
            } else if (e.key == 'ArrowDown') {
                if (highlightedItem === -1 && searchResults.length) {
                    sethighlightedItem(0)
                } else {
                    sethighlightedItem(Math.min(highlightedItem + 1, searchResults.length - 1))
                }
            } else if (e.key === 'Enter' && highlightedItem > -1) {
                const target = e.target.closest('div').parentElement
                window.setTimeout(() => target.querySelector('input').focus(), 50)
            }
        }}
    >
        <label htmlFor='searchText'>{label}</label>
        <input
            className='textSearchInputInput'
            name='searchText'
            type='text'
            placeholder={placeholder}
            onChange={e => onSearch(e.target.value)}
            autoComplete="off"
        />
        <div className={`${styles.searchResults} searchResults`}>
            {searchResults.map(result => {
                return <button
                    type='button'
                    key={result.name}
                    onClick={() => setactiveItems([...activeItems, result])}
                >
                    {result.name}
                </button>
            })}
        </div>
        {showChips ?
            <div className={styles.activeItems}>
                {activeItems.map(item => {
                    return <button
                        className={styles.chip}
                        key={item.name}
                        onClick={() => removeItem(item)}
                        type='button'
                    >
                        {item.name}
                        <span className="material-icons">close</span>
                    </button>
                })}
            </div>
            : ""
        }
    </div>
}

export default TextSearchInput