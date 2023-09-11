"use client"

import React, { useState, useEffect } from 'react'
import styles from './Form.module.scss'
import FileUploader from '../FileUploader/FileUploader'
import fieldComponents from './FieldComponentsGenerated'
import { useRouter } from 'next/navigation'
import { afterFieldChanged } from '@/recordtypes/image/lib/clientHooks'

export default function Form({
    fields,
    initialFiles,
    method,
    action,
    submitMessage,
    acceptedFileTypes,
    allowMultipleFiles,
    requireFileUploadFirst,
    fileUploadedCallback,
    recordType
}) {
    acceptedFileTypes = acceptedFileTypes || ['*']
    requireFileUploadFirst = requireFileUploadFirst || false
    fileUploadedCallback = fileUploadedCallback || false
    initialFiles = initialFiles || []

    // All of the files that will be submitted with the form.
    const [files, setFiles] = useState([])

    /**
     * Convert the initalFiles provided to the form into file
     * objects expected by the files state variable.
     * 
     * @param {array} initialFiles 
     * @return {array} converted files
     */
    const prepareInitialFiles = async (initialFiles) => {
        let updatedFiles = []

        for (const file of initialFiles) {
            const response = await fetch(`/api/file/${file.id}/content`)
            const fileBlob = await response.blob()

            const convertedFile = new File([fileBlob], file.name, { type: file.mimeType })

            getFileIcon(convertedFile).then(icon => {
                updatedFiles.push({
                    file: convertedFile,
                    icon: icon
                })

                setFiles([...updatedFiles])
                setIsFilePicked(true)

                if (!fileWasUploaded) {
                    setFileWasUploaded(true)
                }
            })
        }
    }

    const { push } = useRouter()

    // Add an empty "value" property to each field to hold
    // the field value in state.
    const prepareFieldsForForm = (formFields) => {
        formFields = formFields.map(field => {
            return {
                ...field,
                value: ''
            }
        })
        return formFields
    }

    fields = prepareFieldsForForm(fields)

    // All of the form fields that will be submitted with the form,
    // excluding files input.
    const [masterFields, setMasterFields] = useState(fields)

    // Track whether a file has been uploaded. This value only changes
    // when a file is initially uploaded - if it is later removed, this
    // value will not change again. This variable is used to know when
    // to show the rest of the form for a new file record type.
    const [fileWasUploaded, setFileWasUploaded] = useState(false)

    // If we require a file upload before displaying the form, there will
    // be some additional processing that needs to happen (fetching the new
    // record type field data) before we can display the form. When we finish
    // that processing, we set this variable to true and the rest of the form
    // will render.
    const [readyToDisplayForm, setReadyToDisplayForm] = useState(!requireFileUploadFirst)

    // File uploader state management variables.
    const [isFilePicked, setIsFilePicked] = useState(false)
    const [hovered, setHovered] = useState(false)
    const [fileError, setFileError] = useState('')

    const updateFormForRecordType = async (recordType) => {
        // Get the necessary record type data for the type of file
        // that was uploaded.
        const results = await fetch(`/api/record/${recordType}`)
        const recordTypeData = await results.json()
        console.log(recordTypeData)

        // Update the fields on this form with the record type data.
        const updatedFormFields = prepareFieldsForForm(recordTypeData.fields)
        setMasterFields(updatedFormFields)

        // Display the rest of the form.
        setReadyToDisplayForm(true)
    }

    // When a file is uploaded, find out 
    useEffect(() => {
        if (fileWasUploaded) {
            if (fileUploadedCallback) {
                fileUploadedCallback(files[0].file)
            }
        }
    }, [fileWasUploaded])

    // When the form is first loaded, add any files that were
    // passed in the URL params to the file selector.
    useEffect(() => {
        (async () => {
            prepareInitialFiles(initialFiles)
        })()
    }, [])

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
        afterFieldChanged(masterFields, setMasterFields)
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

                    if (!fileWasUploaded) {
                        setFileWasUploaded(true)
                    }
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
            console.log('File in getFileIcon')
            console.log(file)
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
            {/* Only display the rest of the form if we're ready to. */}
            {!requireFileUploadFirst || (requireFileUploadFirst && readyToDisplayForm) ?
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
                : ''}
        </form>
    )
}
