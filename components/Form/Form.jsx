"use client"

import React, { useState } from 'react'
import styles from './Form.module.scss'
import FileUploader from '../FileUploader/FileUploader'
import fieldComponents from './AllFieldComponents'
import { useRouter } from 'next/navigation'

export default function Form({ fields, method, action, submitMessage, acceptedFileTypes, allowMultipleFiles }) {
    acceptedFileTypes = acceptedFileTypes || ['*']
    const { push } = useRouter()

    // Add an empty "value" property to each field to hold
    // the field value in state.
    fields = fields.map(field => {
        return {
            ...field,
            value: ''
        }
    })

    // All of the form fields that will be submitted with the form,
    // excluding files input.
    const [masterFields, setMasterFields] = useState(fields)

    // All of the files that will be submitted with the form.
    const [files, setFiles] = useState([])

    // File uploader state management variables.
    const [isFilePicked, setIsFilePicked] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [fileError, setFileError] = useState('')

    const handleDragOver = (event) => {
        event.stopPropagation()
        event.preventDefault()
    }

    const handleDragEnter = (event) => {
        event.stopPropagation()
        event.preventDefault()
        setHovered(true)
    }

    const handleDragLeave = (event) => {
        event.stopPropagation()
        event.preventDefault()
        setHovered(false)
    }

    const handleDrop = (event) => {
        event.stopPropagation()
        event.preventDefault()

        const items = event.dataTransfer.items
        let files = []

        for (let i = 0; i < items.length; i++) {
            files.push(items[i].getAsFile())
        }

        fileChangeHandler({
            target: {
                files: files
            }
        })

        setHovered(false)
    }

    const changeHandler = (event) => {
        let updatedMasterFields = [...masterFields]
        updatedMasterFields[event.target.dataset.index].value = event.target.value
        setMasterFields(updatedMasterFields)
    }

    const fileChangeHandler = (event) => {
        let updatedFiles = files
        setFileError('')

        if (!allowMultipleFiles && updatedFiles.length > 0) {
            updatedFiles = []
        }

        for (let i = 0; i < event.target.files.length; i++) {
            const file = event.target.files[i]

            if (!allowMultipleFiles && i > 0) {
                continue;
            }

            // If the uploaded file is of a valid type, process it.
            if (acceptedFileTypes.includes('*') || acceptedFileTypes.includes(file.type)) {
                getFileIcon(file).then(icon => {
                    updatedFiles.push({
                        file: file,
                        icon: icon
                    })

                    setFiles([...updatedFiles])
                    setIsFilePicked(true)
                })
            } else {
                setFileError('One or more of your files could not be selected.')
            }
        }
    }

    const removeFile = (event) => {
        event.stopPropagation()
        setFileError('')

        let updatedFiles = files
        updatedFiles.splice(event.target.dataset.index, 1)
        setFiles([...updatedFiles])
    }

    // Given a file, return an element containing the correct
    // icon to display for it.
    const getFileIcon = (file) => {
        return new Promise((resolve, reject) => {
            if (file.type.includes('image')) {
                const reader = new FileReader()
                reader.addEventListener('load', () => {
                    resolve(<img src={reader.result}></img>)
                })
                reader.readAsDataURL(file)
            } else {
                resolve(<span className={`material-icons ${styles.genericIcon}`}>description</span>)
            }
        })
    }

    const submissionHandler = async (event) => {
        event.preventDefault()

        const formData = new FormData()

        // Add all the non-file fields to the form submission.
        masterFields.forEach((field) => {
            formData.append(field.name, field.value)
        })

        // Add any uploaded files to the form submission.
        files.forEach((file) => {
            formData.append('file', file.file)
        })

        const response = await fetch(action, {
            method: method,
            body: formData
        })
        const json = await response.json()

        push('/records/all')
    }

    const getElement = (field) => {
        let Element = "input"
        const inputTypes = [
            'button',
            'checkbox',
            'color',
            'date',
            'datetime-local',
            'email',
            'file',
            'hidden',
            'image',
            'month',
            'number',
            'password',
            'radio',
            'range',
            'reset',
            'search',
            'submit',
            'tel',
            'text',
            'time',
            'url',
            'week'
        ]

        // If first letter of field type is uppercase it is a component.
        // Otherwise, if field type isn't in list of input types, set Element to that value.
        const firstLetter = Array.from(field.type)[0]
        if (firstLetter === firstLetter.toUpperCase()) {
            Element = fieldComponents[field.type]
        } else if (!inputTypes.includes(field.type)) {
            Element = field.type
        }

        return Element
    }

    return (
        <form
            method={method}
            action={action}
            className={styles.form}
            onSubmit={submissionHandler}
        >
            <div className={styles.fileArea}>
                <FileUploader
                    files={files}
                    isFilePicked={isFilePicked}
                    fileChangeHandler={fileChangeHandler}
                    removeFile={removeFile}
                    dragOver={handleDragOver}
                    dragEnter={handleDragEnter}
                    dragLeave={handleDragLeave}
                    drop={handleDrop}
                    hovered={hovered}
                    error={fileError}
                    allowMultiple={allowMultipleFiles}
                />
            </div>
            <div className={styles.formArea}>
                {masterFields.map((field, index) => {
                    let Element = getElement(field)

                    return (
                        <formitem key={index}>
                            {field.showLabel === false ? '' : <label htmlFor={field.name}>{field.name}</label>}
                            <Element
                                id={field.name}
                                name={field.name}
                                type={field.type}
                                value={field.value}
                                index={index}
                                data-index={index}
                                onChange={changeHandler}
                            >{field.content}</Element>
                        </formitem>
                    )
                })}
                <input type="submit" className="button" value={submitMessage || 'Submit'} />
            </div>
        </form>
    )
}
