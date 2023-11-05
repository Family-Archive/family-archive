"use client"

import React, { useRef } from 'react'
import styles from './FileUploader.module.scss'

/**
 * File uploader component that belongs to the Form
 */

export default function FileUploader({
    files,
    isFilePicked,
    fileChangeHandler,
    removeFile,
    dragOver,
    dragEnter,
    dragLeave,
    drop,
    hovered,
    error,
    allowMultiple
}) {
    // Reference to the file input element
    const fileInputRef = useRef(null)

    // When the file drop area is clicked, manually
    // open the file selector.
    const dropPadClicked = (event) => {
        fileInputRef.current.click()
    }

    return (
        <div className={styles.FileUploader}>
            <div
                className={`${styles.dropPad} ${hovered ? styles.hover : ''}`}
                onClick={dropPadClicked}
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={drop}
            >
                {console.log(files)}
                {isFilePicked ?
                    files.map((file, index) => {
                        { console.log(file) }
                        return (
                            <div key={index} className={styles.filePreview}>
                                {file.icon ? file.icon : <span className={`material-icons ${styles.genericIcon}`}></span>}
                                <div className={styles.fileName}>{file.file.name}</div>
                                <span className={`material-icons ${styles.removeButton}`} data-index={index} onClick={removeFile}>cancel</span>
                            </div>
                        )
                    }) : ''
                }
                {error ? <div className={styles.error}>{error}</div> : ''}
                <div className={styles.dropPadMessage}>{allowMultiple ? 'Click or drag to add files' : 'Click or drag to add a file'}</div>
            </div>
            <input type="file" ref={fileInputRef} onChange={fileChangeHandler} multiple={allowMultiple}></input>
        </div>
    )
}
