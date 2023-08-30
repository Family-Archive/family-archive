"use client"

import { useState } from 'react'
import lib from '@/lib/lib'

import styles from './FileViewer.module.scss'
import FileSelector from './FileSelector/FileSelector'

const FileViewer = (props) => {
    const [activeFile, setactiveFile] = useState(props.files[0])
    const [fullscreen, setfullscreen] = useState(false)

    const setFile = (id) => {
        for (let file of props.files) {
            if (file.id === id) {
                setactiveFile(file)
                return
            }
        }
    }

    const generateFileView = () => {
        const fileDatatype = activeFile ? activeFile.mimeType.split('/')[0] : ""
        switch (fileDatatype) {
            case "image":
                return <>
                    <img className={styles.fileview} src={`/api/file/${activeFile.id}`} />
                    <span className={`${styles.zoom} material-icons`} onClick={() => setfullscreen(!fullscreen)}>zoom_in</span>
                </>
            case "audio":
                return <audio controls className={styles.fileview}>
                    <source src={`/api/file/${activeFile.id}`} type={activeFile.mimeType} />
                </audio>
            default:
                return <div className={styles.fileview}>
                    <span className='material-icons'>description</span>
                    <strong>{activeFile.name}</strong><br />
                    {activeFile.mimeType}<br />
                    {lib.convertBytesToUnit(activeFile.size)}<br />
                    {activeFile.createdAt}<br />
                </div>
        }
    }

    return (
        <div className={styles.FileViewer}>
            <FileSelector files={props.files} setFile={setFile} />
            <div style={{ marginLeft: "5rem" }}>
                <div className={`${styles.fileviewContainer} ${fullscreen ? styles.fullscreen : ""}`}>
                    {generateFileView()}
                </div>

                <a
                    href={`/api/file/${activeFile.id}?download=true`}
                    className={`${styles.download} button`}
                >
                    <span className='material-icons'>download</span>
                    Download
                </a>
            </div>
        </div>
    )
}

export default FileViewer