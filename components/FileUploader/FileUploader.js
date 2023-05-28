"use client"

import React, { useState } from 'react'

export default function FileUploader() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isFilePicked, setIsFilePicked] = useState(false);

    const handleSubmission = async () => {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append('file', file);
        });

        const response = await fetch('/api/files', {
            method: 'POST',
            body: formData
        });
        const jsonResponse = await response.json();
        console.log(jsonResponse);
    }

    const changeHandler = (event) => {
        let files = [];
        for (let i = 0; i < event.target.files.length; i++) {
            files.push(event.target.files[i]);
        }
        setSelectedFiles(files);
        console.log(files);
        setIsFilePicked(true);
    }

    return (
        <div style={{ "padding-top": "6em" }}>
            <div>FileUploader</div>
            <div>
                {isFilePicked ? selectedFiles.map(file => {
                    return (

                        <div>
                            <p>Filename: {file.name}</p>
                            <p>Filetype: {file.type}</p>
                            <p>Size in bytes: {file.size}</p>
                            <p>
                                {file.lastModified}
                            </p>
                        </div>
                    )
                }) : (
                    <p>Select a file to show details</p>
                )}

            </div>
            <input type="file" onChange={changeHandler} multiple></input>
            <input type="submit" value="Submit" onClick={handleSubmission}></input>
        </div>
    )
}
