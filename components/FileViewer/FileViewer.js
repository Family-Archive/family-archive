"use client"

import { useState } from 'react'

import styles from './FileViewer.module.scss'
import FileSelector from './FileSelector/FileSelector'

const FileViewer = (props) => {
    const [files, setfiles] = useState(props.files)
    const [activeFile, setactiveFile] = useState(0)
    const [fullscreen, setfullscreen] = useState(false)
    const [isEditingCaption, setisEditingCaption] = useState(false)

    const setFile = (id) => {
        setisEditingCaption(false)
        for (let i in files) {
            if (files[i].id === id) {
                setactiveFile(i)
                return
            }
        }
    }

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

    const fetchFiles = async () => {
        let record = await fetch(`/api/record/${window.location.pathname.split('/').slice(-1)[0]}`)
        record = await record.json()
        setfiles(record.data.files)
    }

    return (
        <div className={styles.FileViewer}>
            <FileSelector files={files} setFile={setFile} />
            <div style={{ marginLeft: "5rem" }}>
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