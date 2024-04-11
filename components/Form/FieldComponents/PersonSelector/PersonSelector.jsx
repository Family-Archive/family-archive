"use client"
import styles from './PersonSelector.module.scss'

import { useState, useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import { ToastContext } from '@/app/(contexts)/ToastContext'
import PronounSelector from '../PronounSelector/PronounSelector'
import TextSearchInput from '@/components/TextSearchInput/TextSearchInput'

/**
 * This function is passed as the initialData to the TextSearchInput
 * The promise resolves into a list of people that can be ingested by the input, taken from the initial field value
 * @returns {Array}: The list of people prepared for the TextSearchInput
 */
const getInitialData = async value => {
    let people = []
    for (let id of JSON.parse(value)) {
        let person = await fetch(`/api/people/${id}`)
        person = await person.json()
        people.push({ name: person.data.person.fullName, data: person.data.person })
    }
    return people
}

const PersonSelector = ({ value, onChange, index }) => {
    const modalFunctions = useContext(ModalContext)
    const toastFunctions = useContext(ToastContext)

    const [fieldValue, setfieldValue] = useState(value ? JSON.parse(value) : [])
    const [textSearchValue, settextSearchValue] = useState(getInitialData(value))

    /**
     * This function is passed to the input to run on state update
     * @param {Array} value: The search input state, which gets passed to the form
     */
    const valueHasChanged = value => {
        settextSearchValue(value)
        let personIdList = []
        for (let person of value) {
            personIdList.push(person.data.id)
        }
        let _fieldValue = JSON.stringify(personIdList)
        setfieldValue(_fieldValue)
        onChange({
            target: {
                value: _fieldValue,
                dataset: {
                    index: index
                }
            }
        })
    }

    /**
     * This function is passed to the search input to run on field change
     * @param {String} query: The person name to search for
     * @returns {Array}: A list of people in TextSearchInput form
     */
    const fetchPeople = async query => {
        let _people = []
        let people = await fetch(`/api/people?search=${query}`)
        people = await people.json()
        for (let person of people.data.people) {
            _people.push({ name: person.fullName, data: person })
        }
        return _people
    }

    return (
        <div className={styles.PersonSelector}>

            <div className={styles.inputContainer}>
                <span
                    style={{
                        width: '1rem',
                        fontSize: '2.5rem',
                        margin: '0rem 1rem -1rem -0.5rem',
                        alignSelf: 'baseline'
                    }}
                    className="material-icons"
                >
                    boy
                </span>
                <TextSearchInput
                    searchFunction={fetchPeople}
                    runOnUpdate={valueHasChanged}
                    canonicalData={textSearchValue}
                    label=''
                    placeholder='Start typing to find people...'
                />
                <button
                    onClick={e => modalFunctions.addModal(
                        'Add a new person',
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className='formitem'>
                                <label htmlFor='fullName'>Full name</label>
                                <input
                                    type='text'
                                    id='fullName'
                                    name='fullName'
                                    defaultValue={e.target.closest('div').querySelector('input').value}
                                />
                            </div>
                            <div className='formitem'>
                                <label htmlFor='firstName'>Short name</label>
                                <input
                                    type='text'
                                    id='firstName'
                                    name='firstName'
                                    defaultValue={e.target.closest('div').querySelector('input').value.split(' ')[0]}
                                />
                            </div>
                            <div className='formitem'>
                                <label>Pronouns</label>
                                <PronounSelector />
                            </div>

                            <button
                                onClick={() => {
                                    const formData = new FormData()
                                    const fullName = document.querySelector('#fullName').value
                                    const firstName = document.querySelector('#firstName').value
                                    const pronouns = document.querySelector('#pronounsField').value
                                    formData.append('fullName', fullName)
                                    formData.append('shortName', firstName)
                                    formData.append('pronouns', pronouns)
                                    fetch(`/api/people`, {
                                        method: "POST",
                                        body: formData
                                    })
                                        .then(response => response.json())
                                        .catch(error => toastFunctions.createToast("Internal server error"))
                                        .then(data => {
                                            if (data.status === 'success') {
                                                settextSearchValue([
                                                    ...textSearchValue,
                                                    {
                                                        name: data.data.people[0].fullName,
                                                        data: data.data.people[0]
                                                    }
                                                ])
                                                modalFunctions.clearModalStack()
                                            } else {
                                                toastFunctions.createToast(data.message)
                                            }
                                        })
                                }}
                            >Add person</button>
                        </div>
                    )}
                    type='button'
                >
                    <span className="material-icons">person_add</span>
                    Add new person
                </button>
            </div>

            {fieldValue.length === 0 || fieldValue === '[]' ?
                <span style={{ opacity: 0.5, marginLeft: '2.5rem' }}>No people selected</span>
                : ""
            }

        </div>
    )
}

export default PersonSelector