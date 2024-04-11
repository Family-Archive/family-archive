"use client"

import { useContext, useState } from "react"
import { ToastContext } from "@/app/(contexts)/ToastContext"

const RenameComponent = ({ family }) => {
    const toastFunctions = useContext(ToastContext)

    const [currFamily, setfamily] = useState(family)
    const [isEditing, setisEditing] = useState(false)

    const updateFamilyName = async (name) => {
        let formData = new FormData()
        formData.append('name', name)
        fetch(`/api/family/${currFamily.id}`, {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .catch(error => toastFunctions.createToast("Internal server error"))
            .then(data => {
                if (data.status === 'success') {
                    setfamily(data.data.family)
                    setisEditing(false)
                } else {
                    toastFunctions.createToast(data.message, 5)
                }
            })
    }

    return <div>
        {isEditing ?
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                    defaultValue={currFamily.name}
                    type='text'
                    name='familyName'
                    id='familyName'
                    onKeyUp={(e) => { if (e.key === 'Enter') { document.querySelector('#fnSubmit').click() } }}
                />
                <button id='fnSubmit' onClick={() => updateFamilyName(document.querySelector('#familyName').value)}>Save</button>
                <button className="tertiary" onClick={() => setisEditing(false)}>Cancel</button>
            </div>
            : <>
                <h1 style={{ marginBottom: '1rem' }} onClick={() => setisEditing(true)} className="title">{currFamily.name}</h1>
                <span style={{ opacity: 0.5, fontStyle: 'italic', display: 'block', marginTop: '0.5rem' }}>Click to rename</span>
            </>
        }
    </div>
}

export default RenameComponent