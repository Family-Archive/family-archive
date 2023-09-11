"use client"

import React from 'react'
import styles from './Toggle.module.scss'

/**
 * This component is a simple toggle-able switch that holds
 * a boolean value.
 */
export default function Toggle({ value, onChange, index }) {
    // Toggle the value of the component and pass the new value
    // up to the parent form so it can be stored in state.
    const clickHandler = (event) => {
        onChange({
            target: {
                value: !value,
                dataset: {
                    index: index
                }
            }
        })
    }

    return (
        <formitem>
            <div
                onClick={clickHandler}
                className={`${styles.toggleContainer} ${value ? styles.toggleTrue : ''}`}
            >
                <div className={styles.toggleSwitch}></div>
                {value ? <div className={styles.onMessage}>Yes</div> : ''}
                {!value ? <div className={styles.offMessage}>No</div> : ''}
            </div>
        </formitem>
    )
}
