"use client"

import { useEffect, useState } from 'react'
import styles from './PersonFilter.module.scss'

const PersonFilter = (props) => {
    const [peopleMap, setpeopleMap] = useState({})
    const [people, setpeople] = useState(props.people && props.people.split ? props.people.split(',') : [])
    const [personResults, setpersonResults] = useState([])

    /**
     * Make an API call to search for people, given a search term
     * @param {string} query: The name to search for
     */
    const searchPeople = async (query) => {
        let people = await fetch(`/api/people?search=${query}`)
        people = await people.json()
        people = people.data.people.slice(0, 10)
        setpersonResults(people)
    }

    /**
     * Remove a person from the list of people
     * @param {cuid} person: The ID of the person to remove from the list
     */
    const removePerson = (person) => {
        let tempPeople = []
        for (let _person of people) {
            if (_person != person) {
                tempPeople.push(_person)
            }
        }
        setpeople(tempPeople)
    }

    // When the people list is updated, send this up to the controller component and set the URL
    useEffect(() => {
        props.setParam('people', people)
    }, [people])

    // If we're loading this page directly from a URL that contains a list of people, 
    // said list will just contain IDs without any extra information -- but we want to display them in the front end by name.
    // To do this, we make a single request when the component mounts to get the information for all people in the family
    // then we can display names by mapping IDs to names in the dictionary
    //
    // Like we're just getting a big list of all people so we can display names instead of IDs.
    useEffect(() => {
        const setPeopleMap = async () => {
            let map = {}
            let people = await fetch(`/api/people`)
            people = await people.json()
            people = people.data.people
            for (let person of people) {
                map[person.id] = person
            }
            setpeopleMap(map)
        }
        setPeopleMap()
    }, [])


    return (
        <div className={styles.PersonFilter}>
            <label htmlFor='person' id='person'>Person</label>
            <input
                type='text'
                placeholder='Start typing to see suggestions'
                onBlur={() => { setTimeout(() => setpersonResults([]), 100) }}
                onKeyUp={(e) => searchPeople(e.target.value)}
                style={{
                    borderRadius: personResults.length > 0 ? '0.5rem 0.5rem 0 0' : '0.5rem'
                }}
            />
            {personResults.length > 0 ?
                <div className={styles.personList}>
                    {personResults.map(person => {
                        return <button
                            key={person.id}
                            className={styles.person}
                            onClick={() => { if (!people.includes(person.id)) { setpeople([...people, person.id]) } }}
                        >
                            {person.fullName}
                        </button>
                    })}
                </div>
                : ""
            }

            <div className={styles.activeList}>
                {people.map(person => {
                    return <div key={person} className={styles.activePerson}>
                        {peopleMap[person] ? peopleMap[person].fullName : person}
                        <button
                            className={styles.removePerson}
                            onClick={() => removePerson(person)}
                        >
                            <span className="material-icons">close</span>
                        </button>
                    </div>
                })}
            </div>
        </div>
    )
}

export default PersonFilter