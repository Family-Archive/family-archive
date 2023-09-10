"use client"

import { useState, useRef, useEffect } from 'react'
import styles from './Dropdown.module.scss'

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
        <div className={`${styles.Dropdown} ${active ? styles.active : ''}`} ref={myRef}>
            <button className={`${styles.title} tertiary`} onClick={() => setactive(!active)}><span className="material-icons">expand_more</span>{props.title}</button>
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