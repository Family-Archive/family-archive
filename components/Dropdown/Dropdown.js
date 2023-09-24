"use client"

import { useState, useRef, useEffect } from 'react'
import styles from './Dropdown.module.scss'

/**
 * Dropdown menu component
 * Required prop: {string} title: The label to display on the dropdown
 * Required prop: {Array} options: An array of JSX components representing each item in the menu 
 * Optional prop: {string} icon: A material icon name to display instead of the label (this removes the border around the button)
 */

const Dropdown = (props) => {
    const [active, setactive] = useState(false)

    const myRef = useRef();

    const handleClickOutside = e => {
        if (!myRef.current.contains(e.target)) {
            setactive(false)
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    });

    return (
        <div
            className={`
                ${styles.Dropdown} 
                ${active ? styles.active : ''}
                ${props.icon ? styles.icon : ''}
            `}
            ref={myRef}
        >
            <button className={`${styles.title} tertiary`} onClick={() => setactive(!active)}>
                <span className="material-icons">{props.icon ? props.icon : "expand_more"}</span>{props.title}
            </button>
            <div className={styles.options} >
                {props.options.map((option, index) => {
                    return (
                        <div onClick={() => setactive(false)} className={styles.option} key={index}>
                            {option}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Dropdown