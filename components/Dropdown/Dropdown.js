"use client"

import { useState } from 'react'
import styles from './Dropdown.module.scss'

const Dropdown = (props) => {
    const [active, setactive] = useState(false)

    return (
        <div className={`${styles.Dropdown} ${active ? styles.active : ''}`}>
            <button className={`${styles.title} tertiary`} onClick={() => setactive(!active)}><span class="material-icons">expand_more</span>{props.title}</button>
            <div className={styles.options} >
                {props.options.map((option, index) => {
                    return (
                        <div className={styles.option} key={index}>
                            {option}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Dropdown