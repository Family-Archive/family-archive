"use client"
import styles from './RecordSelector.module.scss'

import { useEffect, useState, useContext } from 'react'
import Link from 'next/link'

import { ModalContext } from '@/app/(contexts)/ModalContext'

const RecordSelector = () => {
    const modalFunctions = useContext(ModalContext)
    const [recordTypes, setrecordTypes] = useState([])

    useEffect(() => {
        // Fetch record types in a kind of weird way since this is a client component
        const fetchRecordTypes = async () => {
            let recordTypes = await fetch('/api/record')
            recordTypes = await recordTypes.json()
            setrecordTypes(recordTypes)
        }
        fetchRecordTypes()
    }, [])

    return (
        <div className={styles.RecordSelector}>
            {recordTypes.length ? recordTypes.map(recordType => {
                return <Link
                    href={`/record/create/${recordType.type}`}
                    key={recordType.type}
                    className={`${styles.recordType} button`}
                    onClick={modalFunctions.clearModalStack}
                >
                    {recordType.name}
                </Link>
            }) : ''}
        </div>
    )
}

export default RecordSelector