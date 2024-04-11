"use client"
import styles from './FilterSetting.module.scss'

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'

const FilterSetting = (props) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <div className={styles.FilterSetting}>
            <div className={styles.filterHead}>
                <span className={styles.filterName}>{props.name}</span>
                <button
                    className='secondary'
                    onClick={() => modalFunctions.addModal(`Filter by ${props.name}`,
                        <>
                            <div className='formitem'>
                                <label htmlFor='filterInput'>Search term</label>
                                <input name='filterInput' id="filterInput" type="text" /><br /><br />
                            </div>
                            <button
                                onClick={() => { props.addFilter(props.name, document.querySelector('#filterInput').value); modalFunctions.clearModalStack() }}
                            >
                                Add filter
                            </button>
                        </>,
                        350
                    )}
                >
                    <span className="material-icons">add</span>
                </button>
            </div>

            {props.entries.map(entry => {
                return <span className={styles.entry} key={entry}>
                    {entry}
                    <span
                        className="material-icons"
                        onClick={() => props.removeFilter(props.name, entry)}
                    >
                        remove_circle
                    </span>
                </span>
            })}
        </div>
    )
}

export default FilterSetting