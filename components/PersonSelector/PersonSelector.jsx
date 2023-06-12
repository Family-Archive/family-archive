"use client"

import React, { useState, useEffect, useContext } from 'react'
import styles from './PersonSelector.module.scss'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import AddPersonForm from '../AddPersonForm/AddPersonForm'

export default function PersonSelector() {
    // The value of the text field used to enter people.
    const [input, setInput] = useState('')

    // All of the available people to select from
    const [people, setPeople] = useState([])

    // The items currently in the dropdown list; mostly
    // people, but also an item letting you enter a new
    // person to the system.
    const [listItems, setListItems] = useState([])

    // The people that have currently been selected.
    const [selectedPeople, setSelectedPeople] = useState([])

    // Whether the dropdown list is visible or not.
    const [showDropdown, setShowDropdown] = useState(false)

    // The currently highlighted person in the dropdown list;
    // a list item is highlighted when a user presses the up
    // and down keys to select one.
    const [highlightedPerson, setHighlightedPerson] = useState({})

    // Tracks whether the "add new person" modal is open. Setting
    // this to true causes the modal to open.
    const [modalIsOpen, setModalIsOpen] = useState(false)

    // This a string of a JSON array with the ids of currently
    // selected people. This is used to populate a hidden form
    // field that actually gets submitted with the rest of the
    // form.
    const [peopleToSubmit, setPeopleToSubmit] = useState('[]')

    const modalFunctions = useContext(ModalContext)

    useEffect(() => {
        fetchPeople()
    }, [])

    // Get a list of all the people currently in the database.
    const fetchPeople = async () => {
        let response = await fetch('/api/people')
        let people = await response.json()
        setPeople(people.data.people)
        setListItems([...people.data.people, { id: 'addNew', fullName: 'Add a new person...' }])
    }

    useEffect(() => {
        if (modalIsOpen) {
            addNewPerson()
        }
    }, [modalIsOpen])

    useEffect(() => {
        setHighlightedPerson({})
    }, [showDropdown])

    // Whenever listItems changes, make sure the "add new person"
    // entry appears last in the list.
    const getListItemsWithAddNewAtTheEnd = (items) => {
        const updatedItems = items.filter(item => item.id !== 'addNew')
        // const addNewIndex = items.find(item => item.id === 'addNew')
        // if (addNewIndex) {
        //     items.splice(addNewIndex, 1)
        // }

        return [...updatedItems, { id: 'addNew', fullName: 'Add a new person...' }]
    }

    // Handles changes to the text input where users enter people's names.
    const changeHandler = (event) => {
        setInput(event.target.value)

        // Split the input into search terms where each term is separated by spaces.
        const searchTerms = event.target.value.split(' ')

        // Filter the people showing in the list to include only those people whose
        // names contain the search terms.
        const filteredPeople = people.filter((person) => {
            const caseInsensitiveName = person.fullName.toLowerCase()

            // If this person's name doesn't contain hits for all search terms, remove
            // them from the list.
            for (const searchTerm of searchTerms) {
                if (!caseInsensitiveName.includes(searchTerm.toLowerCase().trim())) {
                    return false
                }
            }
            return true
        });

        setListItems(getListItemsWithAddNewAtTheEnd(filteredPeople))
    }

    const focusHandler = (event) => {
        setShowDropdown(true)
    }

    const blurHandler = (event) => {
        // Delay hiding the dropdown so if the user clicked
        // on a dropdown item the event can happen before
        // it gets hidden.
        // NOTE: There is almost certainly a better way of
        // doing this, and we should fix it at some point!
        setTimeout(() => setShowDropdown(false), 200)
    }

    // Launch the modal with the "Add new person" form.
    const addNewPerson = (event) => {
        modalFunctions.addModal(
            'Add a new person',
            <AddPersonForm name={input} afterSubmission={afterNewPersonSubmission} />,
            styles.addPersonModal
        )
    }

    const afterNewPersonSubmission = () => {
        setModalIsOpen(false)
        fetchPeople()
    }

    // Add a label for the selected person above the selector and
    // remove the selected person from the dropdown list.
    const selectPerson = (event) => {
        if (event.target.dataset.id === 'addNew') {
            addNewPerson(event)
            return
        }

        // Find the person that was just selected.
        const selectedPerson = listItems.find(person => {
            return person.id == event.target.dataset.id
        })

        if (selectedPerson) {
            setSelectedPeople([...selectedPeople, selectedPerson])

            // Remove the selected person from the list of available people.
            const selectedPersonIndex = listItems.indexOf(selectedPerson)
            let updatedListItems = listItems
            updatedListItems.splice(selectedPersonIndex, 1)

            setListItems(getListItemsWithAddNewAtTheEnd(updatedListItems))

            // Add the selected person's id to the array that will ultimately
            // get submitted with the rest of the form.
            let updatedPeopleToSubmit = JSON.parse(peopleToSubmit)
            updatedPeopleToSubmit.push(selectedPerson.id)
            setPeopleToSubmit(JSON.stringify(updatedPeopleToSubmit))
        }
    }

    const removePerson = (event) => {
        let updatedPeople = selectedPeople
        let personToRemove

        for (let index = 0; index < updatedPeople.length; index++) {
            if (updatedPeople[index].id == event.target.dataset.id) {
                personToRemove = updatedPeople[index]
                break
            }
        }

        if (personToRemove) {
            removePersonFromListItems(personToRemove)

            // Remove the person's id from the array that will ultimately
            // get submitted with the rest of the form.
            let updatedPeopleToSubmit = JSON.parse(peopleToSubmit)
            let indexToRemove = updatedPeopleToSubmit.indexOf(personToRemove.id)
            if (indexToRemove !== -1) {
                updatedPeopleToSubmit[indexToRemove] = undefined
                setPeopleToSubmit(JSON.stringify(updatedPeopleToSubmit))
            }
        }
    }

    const removePersonFromListItems = (personToRemove) => {
        let updatedPeople = selectedPeople
        let indexToRemove = updatedPeople.indexOf(personToRemove)

        updatedPeople.splice(indexToRemove, 1)
        setSelectedPeople(updatedPeople)
        if (!listItems.includes(personToRemove)) {
            setListItems(getListItemsWithAddNewAtTheEnd([...listItems, personToRemove]))
        }
    }

    // This function lets users press up, down, and Enter to navigate the
    // list of people and select one to add.
    const keyPressHandler = (event) => {
        // Default behavior is to highlight the first person in the list.
        let newHighlightedIndex = 0

        switch (event.key) {
            case 'Enter':
                event.preventDefault()
                console.log(highlightedPerson)
                if (highlightedPerson.id && highlightedPerson.id !== 'addNew') {
                    selectPerson({ target: { dataset: { id: highlightedPerson.id } } })
                } else {
                    setHighlightedPerson({})
                    setModalIsOpen(true)
                    return
                }
                break
            case 'ArrowDown':
                event.preventDefault()
                // If there is already a person highlighted, highlight
                // the next one down in the list.
                if (highlightedPerson.id) {
                    newHighlightedIndex = listItems.indexOf(highlightedPerson) + 1
                    if (newHighlightedIndex >= listItems.length) {
                        newHighlightedIndex = 0
                    }
                }
                break
            case 'ArrowUp':
                event.preventDefault()
                // If there is already a person highlighted, highlight
                // the previous one in the list.
                if (highlightedPerson.id) {
                    newHighlightedIndex = listItems.indexOf(highlightedPerson) - 1
                    if (newHighlightedIndex < 0) {
                        newHighlightedIndex = listItems.length - 1
                    }
                }
                break
        }

        setHighlightedPerson(listItems[newHighlightedIndex])
    }

    return (
        <formitem>
            <label htmlFor="personSelector">Person</label>
            <div className={styles.selectedPeopleContainer}>
                {selectedPeople.map(person => <span className={styles.selectedPerson} data-id={person.id} key={person.id}>
                    <span className={styles.removePerson} data-id={person.id} onClick={removePerson}>X</span>
                    {person.fullName}
                </span>)}
            </div>
            <input
                id="personSelector"
                type="text"
                value={input}
                onChange={changeHandler}
                onFocus={focusHandler}
                onBlur={blurHandler}
                onKeyDown={keyPressHandler}
                autoComplete='off'
            ></input>
            <input
                name="people"
                type="hidden"
                value={peopleToSubmit}
            ></input>
            <div className={styles.container}>
                {showDropdown ? (
                    <div className={styles.dropdownMenu}>
                        {listItems.map(person => {
                            return <div
                                key={person.id}
                                data-id={person.id}
                                className={`${styles.dropdownItem} ${highlightedPerson.id == person.id ? styles.active : ''}`}
                                onClick={selectPerson}
                            >{person.fullName}</div>
                        })}
                    </div>
                ) : null}
            </div>
        </formitem>
    )
}
