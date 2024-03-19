"use client"

import { useContext } from 'react'
import { ModalContext } from '@/app/(contexts)/ModalContext'
import EditPermissions from '@/components/EditPermissions/EditPermissions'

/**
 * This is a helper component for deleting a record
 * @param {string} id: The ID of the record to delete
 */

const EditPermissionsButton = ({ id }) => {
    const modalFunctions = useContext(ModalContext)

    return (
        <button
            className=""
            onClick={() => modalFunctions.addModal(
                "Edit Permissions",
                <EditPermissions resourceId={id} resourceType='Record' />
            )}
        >
            Edit permissions...
        </button>
    )
}

export default EditPermissionsButton