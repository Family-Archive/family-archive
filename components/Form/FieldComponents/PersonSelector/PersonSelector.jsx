"use client"
import styles from './PersonSelector.module.scss'

import { useEffect, useState, useContext, useRef } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import { ToastContext } from '@/app/(contexts)/ToastContext'
import PronounSelector from '../PronounSelector/PronounSelector'

const PersonSelector = ({ value, onChange, index }) => {
    const modalFunctions = useContext(ModalContext)
    const toastFunctions = useContext(ToastContext)

    // Handle clicks outside of component
    const myRef = useRef();
    const handleClickOutside = e => {
        if (!myRef.current.contains(e.target)) {
            setfieldActive(false)
        }
    };

    // The fieldValue is what is getting passed up to the Form component. It is an array of Person IDs.
    // We have to be careful about when it's being stored as JSON (in the form/database) vs when it's an actual array, in this component here.
    const [fieldValue, setfieldValue] = useState(value ? JSON.parse(value) : [])
    // People is a list of all people in the system, so we can match arrays in the fieldValue for more information (names, etc)
    const [people, setpeople] = useState([])
    // activePeople are the people appearing in the current dropdown
    const [activePeople, setactivePeople] = useState([])
    // fieldActive is whether the dropdown should be shown or not
    const [fieldActive, setfieldActive] = useState(false)
    // activePerson is which item in the dropdown is highlighted
    const [activePersonIndex, setactivePersonIndex] = useState(0)

    /**
     * Our function for setting the state + passing it up to the parent Form
     * @param {Array} value: Our array of IDs
     */
    const updateValue = (value) => {
        document.querySelector('#peopleSearch').value = ""
        setfieldValue(value)
        onChange({
            target: {
                value: JSON.stringify(value),
                dataset: {
                    index: index
                }
            }
        })
    }

    /**
     * Given a search query, we search our list of all people for matches
     * @param {string} query: The name to search for
     */
    const updateActivePeople = (query) => {
        let _activePeople = []
        for (let id of Object.keys(people)) {
            if (people[id].fullName.toLowerCase().includes(query.toLowerCase()) && !fieldValue.includes(id)) {
                _activePeople.push(people[id])
            }
        }
        setactivePeople(_activePeople.slice(0, 5))
    }

    /**
     * Given an ID, remove it from the fieldValue
     * @param {string} id: The ID of the person to remove
     */
    const removeSelectedPerson = id => {
        let tempPeople = []
        for (let person of fieldValue) {
            if (id != person) {
                tempPeople.push(person)
            }
        }
        updateValue(tempPeople)
    }

    /**
     * Given an ID, add it to the fieldValue
     * @param {string} id: The ID of the person to add
     */
    const addSelectedPerson = async id => {
        // If the person we're trying to add isn't in our array, they were probably just created via the "Add Person" form
        // Re-fetch the list of people before adding them to the fieldValue
        if (!Object.keys(people).includes(id)) {
            await fetchPeople()
        }

        if (!fieldValue.includes(id)) {
            updateValue([...fieldValue, id])
        }
    }

    /**
     * Hit the database to fetch a list of all the people in the system
     */
    const fetchPeople = async () => {
        let _people = {}
        let people = await fetch('/api/people')
        people = await people.json()
        for (let person of people.data.people) {
            _people[person.id] = person
        }
        setpeople(_people)
    }

    // Fetch a list of all people when the component mounts
    useEffect(() => {
        fetchPeople()
    }, [])

    // Bind listeners for outside clicks and remove when component unmounts
    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    });

    return (
        <div className={styles.PersonSelector} ref={myRef}>

            {/* Print list of users stored in current value */}
            {fieldValue.length > 0 && Object.keys(people).length > 0 ?
                <div className={styles.selectedPeople}>
                    {fieldValue.map(personId => {
                        // If user doesn't seem to exist, they may have been deleted
                        if (!people[personId]) {
                            return <div className={`${styles.selectedPerson} ${styles.unavailable}`} key={personId}>
                                <button type='button'>
                                    User unavailable
                                </button>
                            </div>
                        }
                        return <div className={styles.selectedPerson} key={personId}>
                            <button type='button' onClick={() => removeSelectedPerson(personId)}>
                                <img src={people[personId].profileImageId ? `/api/file/${people[personId].profileImageId}` : '/icons/no-user.png'} />
                                {people[personId].fullName}
                                <span className="material-icons">close</span>
                            </button>
                        </div>
                    })}
                </div>
                : <span style={{ opacity: 0.5 }}>No users selected</span>
            }

            <input
                type='text'
                id='peopleSearch'
                name='peopleSearch'
                placeholder='Start typing to find people...'
                onKeyUp={e => updateActivePeople(e.target.value)}
                onKeyDown={e => {
                    // Bind key events for navigating dropdown list
                    if (['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
                        if (e.key === 'ArrowDown' && activePersonIndex < activePeople.length) {
                            setactivePersonIndex(activePersonIndex + 1)
                        } else if (e.key === 'ArrowUp' && activePersonIndex > 0) {
                            setactivePersonIndex(activePersonIndex - 1)
                        } else if (e.key === 'Enter') {
                            e.preventDefault()
                            document.querySelector(`.${styles.dropdown} button`).click()
                        }
                    }
                }}
                onFocus={() => setfieldActive(true)}
                autoComplete='off'
                style={{ marginTop: "0.5rem" }}
            />

            {/* Display the list of matching users if field is active */}
            {fieldActive ?
                <div className={styles.dropdown}>
                    {activePeople.map((person, index) => {
                        return <button
                            className={`${styles.person} ${index === activePersonIndex ? 'hovered' : ""} `}
                            onClick={e => addSelectedPerson(person.id)}
                            type='button'
                            key={person.id}
                        >
                            {person.fullName}
                        </button>
                    })}
                    <button
                        onClick={() => modalFunctions.addModal(
                            'Add a new person',
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <formitem>
                                    <label htmlFor='fullName'>Full name</label>
                                    <input
                                        type='text'
                                        id='fullName'
                                        name='fullName'
                                        defaultValue={document.querySelector('#peopleSearch').value}
                                    />
                                </formitem>
                                <formitem>
                                    <label htmlFor='firstName'>First name</label>
                                    <input
                                        type='text'
                                        id='firstName'
                                        name='firstName'
                                        defaultValue={document.querySelector('#peopleSearch').value.split(' ')[0]}
                                    />
                                </formitem>
                                <formitem>
                                    <label>Pronouns</label>
                                    <PronounSelector />
                                </formitem>

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
                                                    addSelectedPerson(data.data.people[0].id)
                                                    modalFunctions.clearModalStack()
                                                } else {
                                                    toastFunctions.createToast(data.message)
                                                }
                                            })
                                    }}
                                >Add person</button>

                            </div>
                        )} className={`${styles.person} ${activePersonIndex > activePeople.length - 1 ? 'hovered' : ""}`}
                        type='button'
                    >
                        <span className="material-icons">person_add</span>
                        Add new person
                    </button>
                </div>
                : ""
            }

        </div>
    )
}

export default PersonSelector