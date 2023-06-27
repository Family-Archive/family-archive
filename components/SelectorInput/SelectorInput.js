"use client"
import styles from './SelectorInput.module.scss'

import { useState } from 'react'

const SelectorInput = (props) => {
    const [value, setvalue] = useState(props.default)
    const [showMenu, setshowMenu] = useState(false)

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
        <div className={styles.SelectorInput}>
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