"use client"
import styles from './FamilySelector.module.scss'

import { useEffect, useState } from 'react'
import TextSearchInput from '@/components/TextSearchInput/TextSearchInput'

const FamilySelector = ({ value, index, onChange }) => {
    const [textSearchValue, settextSearchValue] = useState([])
    const [defaultFamily, setdefaultFamily] = useState(JSON.parse(value).defaultFamily)

    /**
   * This function is passed to the input to run on state update
   * @param {Array} value: The search input state, which gets passed to the form
   */
    const valueHasChanged = value => {
        settextSearchValue(value)
        let formValue = {
            families: value,
            defaultFamily: defaultFamily
        }
        onChange({
            target: {
                value: JSON.stringify(formValue),
                dataset: {
                    index: index
                }
            }
        })
    }

    /**
     * Remove a given family from the textSearchValue
     * @param {string} familyToRemove: The id of the family to remove
     */
    const removeFamily = familyToRemove => {
        let _families = []
        for (let family of textSearchValue) {
            if (familyToRemove.data.id != family.data.id) {
                _families.push(family)
            }
        }

        if (_families.length === 1) {
            setdefaultFamily(_families[0].data.id)
        }

        settextSearchValue(_families)
    }

    /**
     * The family search function passed to the text input
     * @param {string} query: The query to search for
     * @returns {Array}: The list of TextSearchInput-formatted family data
     */
    const fetchfamilies = async query => {
        let _families = []
        let families = await fetch(`/api/family?search=${query}`)
        families = await families.json()
        for (let family of families.data.families) {
            _families.push({ name: family.name, data: family })
        }
        return _families
    }

    // If either of these values get updated, we want to call valueHasChanged so that it propagates up to the parent Form component
    useEffect(() => {
        valueHasChanged(textSearchValue)
    }, [defaultFamily, textSearchValue])

    // When the component loads, take the initial field data provided by the form and format it so that 
    // we can pass it to the TextSearchInput
    useEffect(() => {
        let _families = []
        for (let family of JSON.parse(value).families) {
            _families.push({
                name: family.name,
                data: family.data
            })
        }
        settextSearchValue(_families)
    }, [])

    return (
        <div className={styles.FamilySelector}>
            <div className={styles.activeFamilies}>
                {textSearchValue.map(family => {
                    return <div
                        className={`${styles.family} ${defaultFamily === family.id ? styles.default : ""}`}
                        key={family.data.id}
                    >
                        {family.name}
                        <div className={styles.options}>
                            {
                                defaultFamily === family.data.id ? <span className={styles.defaultLabel}>
                                    Default <span className="material-icons">done</span>
                                </span>
                                    : <button onClick={() => setdefaultFamily(family.data.id)} className='secondary' type='button'>Make default</button>
                            }
                            {textSearchValue.length > 1 ?
                                <a href="#"><span onClick={() => removeFamily(family)} className="material-icons">cancel</span></a>
                                : ""
                            }
                        </div>
                    </div>
                })}
            </div>
            <TextSearchInput
                searchFunction={fetchfamilies}
                runOnUpdate={valueHasChanged}
                canonicalData={textSearchValue}
                label=''
                placeholder='Start typing to search families...'
                showChips={false}
            />
        </div>
    )
}

export default FamilySelector