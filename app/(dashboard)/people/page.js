"use client"
import { useEffect, useState } from 'react'
import styles from './peoplePage.module.scss'

import Link from 'next/link'

/**
 * This page displays all of the people in the system
 */

const peoplePage = () => {
    const [people, setpeople] = useState([])
    const [query, setquery] = useState("")

    // Since this is a client component, ask the API for the list of people when the component mounts
    useEffect(() => {
        const fetchPeople = async () => {
            let people = await fetch(`/api/people`)
            people = await people.json()
            setpeople(people.data.people)
        }
        fetchPeople()
    }, [])

    return (
        <div className={styles.peoplePage}>
            <div className="topBar">
                <h1 className='title'>People</h1>
                <div className='pageOptions'>
                    <Link href='/people/add'>
                        <button><span className="material-icons">person_add</span>Add person</button>
                    </Link>
                </div>
            </div>

            <div>
                <label htmlFor='peopleSearch'>Search people</label>
                <input
                    type='text'
                    name='peopleSearch'
                    id='peopleSearch'
                    autoComplete='false'
                    onKeyUp={e => setquery(e.target.value)}
                    placeholder='Start typing to filter list'
                />
            </div><br />
            <div className={styles.people}>
                {people.map(person => {
                    if (query.toLowerCase() && !person.fullName.toLowerCase().includes(query)) {
                        return
                    }

                    return <Link href={`/people/${person.id}`}>
                        <div className={styles.person}>
                            <img
                                className={styles.profileImage}
                                src={person.profileImageId ? `/api/file/${person.profileImageId}` : "/icons/no-user.png"}
                            />
                            {person.fullName} / {person.shortName}
                        </div>
                    </Link>
                })}
            </div>
        </div>
    )
}

export default peoplePage