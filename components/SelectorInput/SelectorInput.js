"use client"
import styles from './SelectorInput.module.scss'

import { useState, useRef, useEffect } from 'react'

/**
 * A selectable list component
 * defaultOption: The default option that should be selected when the component loads (this must EXACTLY match one of the values of the options array)
 * onChange: A function callback to run when an option is changed
 * options: The array of options to display
 * direction: Which direction the options should expand. "up" or "down"
 */

const SelectorInput = ({ defaultOption, onChange, options, direction }) => {
    const [value, setvalue] = useState(defaultOption)
    const [showMenu, setshowMenu] = useState(false)

    // Handle clicks outside the component
    const myRef = useRef();
    const handleClickOutside = e => {
        if (!myRef.current.contains(e.target)) {
            setshowMenu(false)
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    });

    /**
     * Update the value of the component
     * @param {*} valueToSet: Self explanatory
     * @param {*} settable: Whether this option is actually allowed to be set or not
     */
    const updateValue = (valueToSet, settable = true) => {
        setshowMenu(!showMenu)
        if (settable !== false) {
            setvalue(valueToSet)
        }
        if (value != valueToSet) {
            onChange(valueToSet)
        }
    }

    return (
        <div className={styles.SelectorInput} ref={myRef}>
            <div className={`${styles.options} ${direction ? styles[direction] : ""}`}>

                {options.map(option => {
                    if (option.value == value) {
                        return <button
                            className={`${styles.mainButton} ${showMenu ? styles.active : ""}`}
                            onClick={() => updateValue(option.value)}
                            key={option.value}
                            type="button"
                        >
                            {option.name}
                            <span className="material-icons">expand_less</span>
                        </button>
                    }
                })}

                <div className={`
                    ${styles.menu}
                    ${showMenu ? styles.active : ""}
                `}>
                    {options.map(option => {
                        if (option.value != value) {
                            return <button
                                key={option.value}
                                onClick={() => updateValue(option.value, option?.settable)}
                                dangerouslySetInnerHTML={{ __html: option.name }}
                                type="button"
                            />
                        }
                    })}
                </div>

            </div>
        </div>
    )
}

export default SelectorInput