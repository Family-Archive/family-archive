import { useContext, useState } from "react"
import { ModalContext } from "@/app/(contexts)/ModalContext"
import LocationModal from "./LocationModal"

const LocationSelector = ({ value, index, onChange }) => {
    const modalFunctions = useContext(ModalContext)

    const updateValue = (value) => {
        onChange({
            target: {
                value: value,
                dataset: {
                    index: index
                }
            }
        })
    }

    return (
        <div>
            <button
                type="button"
                onClick={() => {
                    modalFunctions.addModal(
                        "Add location",
                        <LocationModal />
                    )
                }}
            >
                Add location
            </button>
        </div>
    )
}

export default LocationSelector