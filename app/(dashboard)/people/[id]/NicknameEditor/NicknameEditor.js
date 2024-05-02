"use client"

import { useState } from 'react'
import styles from './NicknameEditor.module.scss'

const NicknameEditor = ({ person }) => {

    const [editing, setediting] = useState(false)
    const [nickname, setnickname] = useState(person.Nickname[0]?.name || null)

    const personId = person.id

    const updateNickname = async _nickname => {
        let formData = new FormData()
        formData.append('nickname', _nickname)
        formData.append('personId', personId)
        let result = await fetch(`/api/nickname`, {
            method: "POST",
            body: formData
        })
        result = await result.json()
        if (result.status === "success") {
            setnickname(_nickname)
        }

        setediting(false)
    }

    return <div className={styles.NicknameEditor}>
        {editing ?
            <div className={styles.editor}>
                <input
                    id='nickname'
                    placeholder="Enter nickname here"
                    defaultValue={nickname || ""}
                    type='text'
                    onKeyUp={e => { e.key === 'Enter' ? updateNickname(document.querySelector('#nickname').value) : "" }}
                />
                <button onClick={() => updateNickname(document.querySelector('#nickname').value)}>Save</button>
                <button className='tertiary' onClick={() => setediting(false)}>Cancel</button>
            </div>
            : <button onClick={() => setediting(true)}>
                {nickname ? <h1>({nickname})</h1> : ""}
                <i><span className={styles.hint}>{nickname ? "Click on nickname to edit" : "Click here to add a nickname"}</span></i>
            </button>
        }
    </div>
}

export default NicknameEditor