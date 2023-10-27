"use client"
import styles from './RecordSelector.module.scss'

import { useEffect, useState, useContext } from 'react'
import Link from 'next/link'
import Form from '../Form/Form'
import lib from './lib'
import clientLib from '@/lib/client/lib'
import { useRouter } from 'next/navigation'

import { ModalContext } from '@/app/(contexts)/ModalContext'

const RecordSelector = () => {
    const modalFunctions = useContext(ModalContext)
    const [recordTypes, setrecordTypes] = useState([])
    const router = useRouter()

    useEffect(() => {
        // Fetch record types in a kind of weird way since this is a client component
        const fetchRecordTypes = async () => {
            let recordTypes = await fetch('/api/record')
            recordTypes = await recordTypes.json()
            setrecordTypes(recordTypes)
        }
        fetchRecordTypes()
    }, [])

    const handleFileUpload = async (file) => {
        // Store selected file.
        const formData = new FormData()
        formData.append('file', file)

        const result = await fetch('/api/file', {
            method: 'POST',
            body: formData
        })
        const json = await result.json()
        const fileId = json.data.files[0].id

        const recordType = lib.getRecordTypeFromMimeType(file)
        router.push(`record/create/${recordType}?files=${fileId}`)

        // Hide the modal when we've redirected to the new page,
        // otherwise it will remain open.
        // modalFunctions.popModal()
        modalFunctions.clearModalStack()
    }

    return (
        <div className={styles.RecordSelector}>
            <div className={styles.leftPanel}>
                <Form
                    fields={[]}
                    method="POST"
                    action={null}
                    acceptedFileTypes={['*']}
                    allowMultipleFiles={false}
                    requireFileUploadFirst={true}
                    fileUploadedCallback={handleFileUpload}
                />
            </div>
            <div className={styles.rightPanel}>
                <div>Or choose from one of these record types:</div>
                <div className={styles.recordTypeButtons}>
                    {recordTypes.length ? recordTypes.map(recordType => {
                        const recordIcon = clientLib.renderIconFromData(recordType.icon)

                        return <Link
                            href={`/record/create/${recordType.type}`}
                            key={recordType.type}
                            className={`${styles.recordType} button tertiary`}
                            onClick={modalFunctions.clearModalStack}
                        >
                            {recordIcon}
                            {recordType.name}
                        </Link>
                    }) : ''}
                </div>
            </div>
        </div>
    )
}

export default RecordSelector