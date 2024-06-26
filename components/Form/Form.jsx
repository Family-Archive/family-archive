"use client"

import React, { useState, useEffect, useContext } from 'react'
import styles from './Form.module.scss'
import FileUploader from '../FileUploader/FileUploader'
import fieldComponents from './FieldComponentsGenerated'
import { useRouter } from 'next/navigation'
import { ToastContext } from '@/app/(contexts)/ToastContext'
import { afterFieldChanged } from '@/recordtypes/image/lib/clientHooks'

export default function Form({
    fields,
    method,
    action,
    submitMessage,
    acceptedFileTypes,
    allowMultipleFiles,
    requireFileUploadFirst,
    fileUploadedCallback,
    recordType,
    editMode,
    fileIds,
    loadFilesFromUrl,
    redirectLocation,
    allowFileUpload = true,
    redirect = false
}) {
    acceptedFileTypes = acceptedFileTypes || ['*']
    requireFileUploadFirst = requireFileUploadFirst || false
    fileUploadedCallback = fileUploadedCallback || false

    const toastFunctions = useContext(ToastContext)

    // All of the files that will be submitted with the form.
    const [files, setFiles] = useState([])

    /**
     * Convert the initalFiles provided to the form into file
     * objects expected by the files state variable.
     * 
     * @return {array} converted files
     */
    const prepareInitialFiles = async () => {
        let initialFiles = []

        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.get('files')) {
            initialFiles = urlParams.get('files').split(',')
        }

        for (const file of initialFiles) {
            addFileToSelector(file)
        }
    }

    const { push } = useRouter()

    // Add an empty "value" property to each field to hold
    // the field value in state.
    const prepareFieldsForForm = (formFields) => {
        formFields = formFields.map(field => {
            if (field.value) {
                return field
            } else {
                return {
                    ...field,
                    value: ''
                }
            }
        })

        return formFields
    }

    fields = prepareFieldsForForm(fields)

    // All of the form fields that will be submitted with the form,
    // excluding files input.
    const [masterFields, setMasterFields] = useState(fields)

    // Dictionary containing potential field validation errors, where the key is the name of the field and the value is the error message
    const [errors, seterrors] = useState({})

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

    // Load any necessary files into the file selector.
    useEffect(() => {
        (async () => {

            // If this form is in editing mode, load any necessary files
            // from storage.
            if (editMode) {
                addFilesToSelectorById(fileIds)
            }

            // Otherwise, check to see if any initial files were passed in
            // the URL params and load any that are found.
            else {
                if (loadFilesFromUrl) {
                    prepareInitialFiles()
                }
            }
        })()
    }, [])

    // Retrieve files from backend and load them into file selector.
    const addFilesToSelectorById = async (fileIds) => {
        for (const fileId of fileIds) {
            addFileToSelector(fileId)
        }
    }

    const addFileToSelector = async (fileId) => {
        let updatedFiles = files

        const response = await fetch(`/api/file/${fileId}`)
        const fileBlob = await response.blob()

        const convertedFile = new File([fileBlob], response.headers.get('X-File-Name'), { type: fileBlob.type })

        getFileIcon(convertedFile).then(icon => {
            // Check if the selector already includes a file with this id.
            const existingId = updatedFiles.find(file => file.fileId == fileId)
            if (existingId !== undefined) {
                return
            }

            updatedFiles.push({
                file: convertedFile,
                icon: icon,
                fileId: fileId
            })

            setFiles([...updatedFiles])
            setIsFilePicked(true)

            if (!fileWasUploaded) {
                setFileWasUploaded(true)
            }
        })
    }

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
        let tempErrors = {}
        seterrors(tempErrors)

        // Add all the non-file fields to the form submission.
        masterFields.forEach((field) => {
            if (field.required === true && field.value == "") {
                tempErrors[field.name] = `${field.label} is a required field!`
            }

            formData.append(field.name, field.value)
        })

        // If we found any errors, set them and don't process the rest of the form.
        if (Object.keys(tempErrors).length > 0) {
            seterrors(tempErrors)
            return
        }

        if (editMode) {
            files.forEach((file) => {
                // If the file doesn't have an id, we need to add it like
                // a normal file so it can be stored. It will then be connected
                // to the record on the backend.
                if (!file.fileId) {
                    formData.append('files', file.file)
                } else {
                    formData.append('files', file.fileId)
                }
            })
        } else {
            // Add any uploaded files to the form submission.
            files.forEach((file) => {
                formData.append('files', file.file)
            })
        }

        const response = await fetch(action, {
            method: method,
            body: formData
        })

        if (response.status < 200 || response.status >= 300) {
            try {
                const json = await response.json()
                toastFunctions.createToast(json.message)
            } catch (e) {
                const error = await response.error()
                console.log(error)
            }

            return
        }

        const json = await response.json()

        if (!redirectLocation) {
            redirectLocation = '/records/all'
        }
        if (redirect) {
            window.location.href = redirectLocation
        } else {
            push(redirectLocation)
        }
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
            {allowFileUpload ?
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
                : ""
            }
            {/* Only display the rest of the form if we're ready to. */}
            {!requireFileUploadFirst || (requireFileUploadFirst && readyToDisplayForm) ?
                <div className={styles.formArea}>
                    {masterFields.map((field, index) => {
                        let Element = getElement(field)

                        return (
                            <div className="formitem" key={index}>
                                {field.showLabel === false ? '' : <label htmlFor={field.name}>{field.label}</label>}
                                <Element
                                    id={field.name}
                                    name={field.name}
                                    type={field.type}
                                    value={field.value}
                                    index={index}
                                    data-index={index}
                                    onChange={changeHandler}
                                >{field.content}</Element>
                                {errors[field.name] ? <span className={styles.fieldError}>{errors[field.name]}</span> : ""}
                            </div>
                        )
                    })}
                    <input type="submit" className="button" value={submitMessage || 'Submit'} />
                </div>
                : ''}
        </form>
    )
}
