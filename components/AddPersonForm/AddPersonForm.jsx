"use client"

import React, { useState, useEffect } from 'react'
import styles from './AddPersonForm.module.scss'

export default function AddPersonForm({ name, afterSubmission }) {
    const [fields, setFields] = useState({
        fullName: name,
        shortName: name.split(' ')[0],
        pronouns: { id: null },
        error: ''
    })

    const [errors, setErrors] = useState({
        fullName: '',
        shortName: ''
    })

    const [pronounSets, setPronounSets] = useState([])

    useEffect(() => {
        document.querySelector('#fullName').focus()
        const getPronounSets = async () => {
            const response = await fetch('/api/pronounset')
            const pronounSets = await response.json()
            setPronounSets(pronounSets.data.pronounSets)
            setFields({
                ...fields,
                pronouns: pronounSets.data.pronounSets[0].id
            })
        }
        getPronounSets()
    }, [])

    const inputChange = async (event) => {
        const name = event.target.name;
        const value = event.target.value;

        setFields({
            ...fields,
            [name]: value
        })
    }

    const handleSubmit = async (event) => {
        event.preventDefault()

        // Clear any existing errors.
        setFields({
            ...fields,
            error: ''
        })

        setErrors({
            fullName: '',
            shortName: ''
        })

        const formData = new FormData()
        formData.append('fullName', fields.fullName)
        formData.append('shortName', fields.shortName)
        formData.append('pronouns', fields.pronouns)

        const response = await fetch('/api/people', {
            method: 'POST',
            body: formData
        })
        const json = await response.json()

        if (json.status === 'success') {
            afterSubmission(json.data.people[0].id)
            return
        }

        // Handle form validation errors
        if (json.status === 'fail') {
            setErrors({
                ...errors,
                ...json.data
            })
        }

        else {
            setFields({
                ...fields,
                error: 'This person could not be saved.'
            })
        }
    }

    return (
        <form id="newPersonForm" className={styles.newPersonForm} onSubmit={handleSubmit}>
            <formitem>
                <label htmlFor="fullName">Full Name</label>
                <input type="text" id="fullName" name="fullName" onChange={inputChange} value={fields.fullName}></input>
                {errors.fullName ? <div className={styles.error}>{errors.fullName}</div> : ''}
            </formitem>

            <formitem>
                <label htmlFor="shortName">First Name</label>
                <input type="text" id="shortName" name="shortName" onChange={inputChange} value={fields.shortName}></input>
                {errors.shortName ? <div className={styles.error}>{errors.shortName}</div> : ''}
            </formitem>

            <formitem>
                <label htmlFor="pronouns">Pronouns</label>
                <select id="pronouns" name="pronouns" value={fields.pronouns.id} onChange={inputChange}>
                    {pronounSets.map(pronounSet => {
                        return <option value={pronounSet.id} key={pronounSet.id}>{`${pronounSet.subject}/${pronounSet.object}/${pronounSet.possessive}`}</option>
                    })}
                </select>
            </formitem>

            {fields.error ? <div className={styles.error}>{fields.error}</div> : ''}

            <input type="submit" value="Add person"></input>
        </form>
    )
}
