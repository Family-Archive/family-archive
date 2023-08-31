"use client"
import styles from './SelectorInput.module.scss'

import { useState, useRef, useEffect } from 'react'

const SelectorInput = (props) => {
    const [value, setvalue] = useState(props.default)
    const [showMenu, setshowMenu] = useState(false)

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

    const updateValue = (valueToSet, settable = true) => {
        setshowMenu(!showMenu)
        if (settable !== false) {
            setvalue(valueToSet)
        }
        if (value != valueToSet) {
            props.onChange(valueToSet)
        }
    }

    return (
        <div className={styles.SelectorInput} ref={myRef}>
            <div className={styles.options}>

                {props.options.map(option => {
                    if (option.value === value) {
                        return <button
                            className={`${styles.mainButton} ${showMenu ? styles.active : ""}`}
                            onClick={() => updateValue(option.value)}
                            key={option.value}
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
                    {props.options.map(option => {
                        if (option.value !== value) {
                            return <button
                                key={option.value}
                                onClick={() => updateValue(option.value, option?.settable)}
                                dangerouslySetInnerHTML={{ __html: option.name }}
                            />
                        }
                    })}
                </div>

            </div>
        </div>
    )
}

export default SelectorInput