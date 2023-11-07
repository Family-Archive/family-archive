"use client"

import { useEffect, useState } from 'react'

import styles from './FileViewer.module.scss'
import FileSelector from './FileSelector/FileSelector'

/**
 * File viewer component for browsing files attached to a record
 * Required param initialFiles: The list of files that we want to display
 */

const FileViewer = ({ initialFiles }) => {
    const [files, setfiles] = useState(initialFiles)
    const [activeFile, setactiveFile] = useState(0)
    const [fullscreen, setfullscreen] = useState(false)
    const [isEditingCaption, setisEditingCaption] = useState(false)

    /**
     * Given a file ID, make that file active in the viewer
     * @param {string} id: The ID of the file we want to make active
     */
    const setFile = (id) => {
        setisEditingCaption(false)
        for (let i in files) {
            if (files[i].id === id) {
                setactiveFile(i)
                return
            }
        }
    }

    /**
     * Dynamically generates a file UI based on type
     */
    const generateFileView = () => {
        const fileDatatype = files[activeFile] ? files[activeFile].mimeType.split('/')[0] : ""
        switch (fileDatatype) {
            case "image":
                return <>
                    <img className={styles.fileview} src={`/api/file/${files[activeFile].id}`} />
                    <span className={`${styles.zoom} material-icons`} onClick={() => setfullscreen(!fullscreen)}>zoom_in</span>
                </>
            case "audio":
                return <audio controls className={styles.fileview}>
                    <source src={`/api/file/${files[activeFile].id}`} type={files[activeFile].mimeType} />
                </audio>
            default:
                return <div className={styles.fileview}>
                    <span className='material-icons'>description</span>
                    <strong>{files[activeFile].name}</strong><br />
                    {files[activeFile].mimeType}<br />
                    {clentLib.convertBytesToUnit(files[activeFile].size)}<br />
                    {files[activeFile].createdAt}<br />
                </div>
        }
    }

    /**
     * Saves a given caption into the active file
     * @param {string} caption: The caption we want to add to the active file
     */
    const saveCaption = async caption => {
        const formData = new FormData()
        formData.append('caption', caption)
        let file = await fetch(`/api/file/${files[activeFile].id}`, {
            method: 'PUT',
            body: formData
        })
        file = await file.json()

        setisEditingCaption(false)
        fetchFiles()
    }

    /**
     * Fetch files attached to the record we're looking at
     */
    const fetchFiles = async () => {
        let record = await fetch(`/api/record/${window.location.pathname.split('/').slice(-1)[0]}`)
        record = await record.json()
        setfiles(record.data.files)
    }

    /**
     * Sets the active file programmatically and scrolls the selector to keep it in view
     * @param {int} activeFileIndex: The index of the new active file
     */
    const scrollSelector = (activeFileIndex) => {
        if (!files[activeFileIndex]) {
            return
        }

        setactiveFile(activeFileIndex)
        const fileInSelector = document.querySelectorAll('.selectorItem')[activeFileIndex]
        document.querySelector(".fileSelector").scrollTo({ left: 0, top: fileInSelector.offsetTop, behavior: 'smooth' })
    }

    // If caption-editing is enabled, focus the field
    useEffect(() => {
        if (isEditingCaption) {
            document.querySelector('#captionEditor').focus()
        }
    }, [isEditingCaption])


    return (
        <div className={styles.FileViewer}>
            <div>
                <FileSelector files={files} setFile={setFile} activeFile={activeFile} />
                <div style={{ marginTop: '31rem' }}>
                    <button
                        className={`tertiary ${styles.galleryNav}`}
                        onClick={() => scrollSelector(parseInt(activeFile) - 1)}
                    >
                        <span class="material-icons">arrow_back</span>
                    </button>
                    <button
                        className={`tertiary ${styles.galleryNav}`}
                        onClick={() => scrollSelector(parseInt(activeFile) + 1)}
                    >
                        <span class="material-icons">arrow_forward</span>
                    </button>

                </div>
            </div>
            <div>
                <div className={`${styles.fileviewContainer} ${fullscreen ? styles.fullscreen : ""}`}>
                    {generateFileView()}

                    <a
                        href={`/api/file/${files[activeFile].id}?download=true`}
                        className={`${styles.download} button`}
                    >
                        <span className='material-icons'>download</span>
                        Download
                    </a>
                </div>
                <span className={styles.title}>{files[activeFile].name}</span>
                {isEditingCaption ? <div className={styles.captionEditor}>
                    <textarea
                        id='captionEditor'
                        defaultValue={files[activeFile].caption}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveCaption(e.target.value) } }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => saveCaption(document.querySelector('#captionEditor').value)}>Save</button>
                        <button className="tertiary" onClick={() => setisEditingCaption(false)}>Cancel</button>
                    </div>
                </div>
                    : <div onClick={() => setisEditingCaption(true)}>
                        <div className={styles.caption}>
                            <a href="#">
                                {files[activeFile].caption}
                            </a>
                        </div>
                        <i style={{ opacity: 0.5 }}>
                            Click {files[activeFile].caption ? 'on caption' : 'here'} to {files[activeFile].caption ? 'edit' : 'add a caption'}
                        </i>
                    </div>
                }
            </div>
        </div>
    )
}

export default FileViewer