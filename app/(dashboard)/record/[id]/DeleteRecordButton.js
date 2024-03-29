"use client"

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'

/**
 * This is a helper component for deleting a record
 * @param {string} id: The ID of the record to delete
 */

const DeleteButton = ({ id }) => {
  const modalFunctions = useContext(ModalContext)

  return (
    <button
      className="delete"
      onClick={() => modalFunctions.addModal(
        "Are you sure?",
        <>
          <p>Are you sure you want to delete this record?</p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => fetch(`/api/record/${id}`, { method: "DELETE" })
                .then(response => response.json())
                .then(data => { window.location = '/records/all' })
              }
            >
              Yes
            </button>
            <button className="tertiary" onClick={modalFunctions.popModal}>Cancel</button>
          </div>
        </>
      )}
    >
      {/* <span className="material-icons">delete_forever</span> */}
      Delete record
    </button>
  )
}

export default DeleteButton