"use client"

import { useState } from 'react'

import styles from './FileViewer.module.scss'
import FileSelector from './FileSelector/FileSelector'

const FileViewer = (props) => {
    const [activeFile, setactiveFile] = useState(props.files[0])

    const setFile = (id) => {
        for (let file of props.files) {
            if (file.id === id) {
                setactiveFile(file)
                return
            }
        }
    }

    return (
        <div className={styles.FileViewer}>
            {activeFile.mimeType.includes('image') ?
                <img className={styles.fileview} src={`/api/file/${activeFile.id}`} /> :
                <div className={styles.fileview}><span className='material-icons'>description</span>{activeFile.name}</div>
            }
            <a
                href={`/api/file/${activeFile.id}?download=true`}
                className={`${styles.download} button`}
            >
                <span className='material-icons'>download</span>
                Download
            </a>
            <FileSelector files={props.files} setFile={setFile} />
        </div>
    )
}

export default FileViewer