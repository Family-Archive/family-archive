"use client"

import { ModalContext } from "@/app/(contexts)/ModalContext"
import { useContext } from "react"

const DeleteButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)

    return <div style={{ right: '0', top: '0', position: 'absolute' }}>
        <button
            className="delete"
            onClick={() => {
                modalFunctions.addModal(
                    "Are you sure?",
                    <>
                        <span style={{ background: 'red', padding: '0.5rem', color: 'white', borderRadius: "0.5rem" }}>
                            Deleting a family will delete all content belonging to that family.
                        </span><br /><br />
                        <span>No records, people, or any other items that belong to the family will be retained.<br />Are you sure you want to do this?</span>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button
                                onClick={() => {
                                    fetch(`/api/family/${id}`, { method: "DELETE", })
                                        .then(response => response.json())
                                        .catch(error => toastFunctions.createToast("Internal server error"))
                                        .then(data => {
                                            if (data.status === 'success') {
                                                window.location = `/families/`
                                            }
                                        })
                                }}
                            >
                                Yes, I'm sure
                            </button>
                            <button onClick={modalFunctions.clearModalStack} className="tertiary">Cancel</button>
                        </div>
                    </>
                )
            }}
        >
            <span class="material-icons">delete_forever</span> Delete family
        </button>
    </div>
}

export default DeleteButton