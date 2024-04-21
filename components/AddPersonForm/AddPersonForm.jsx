"use client"

import React, { useState, useEffect } from 'react'
import styles from './AddPersonForm.module.scss'

export default function AddPersonForm({ name, afterSubmission }) {
    const [fields, setFields] = useState({
        fullName: name,
        shortName: name.split(' ')[0],
        error: ''
    })

    const [errors, setErrors] = useState({
        fullName: '',
        shortName: ''
    })

    const [pronounSets, setPronounSets] = useState([])

    useEffect(() => {
        document.querySelector('#fullName').focus()
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

            {fields.error ? <div className={styles.error}>{fields.error}</div> : ''}

            <input type="submit" value="Add person"></input>
        </form>
    )
}
