import { useContext, useEffect, useState } from "react"
import dynamic from 'next/dynamic'
import { ModalContext } from "@/app/(contexts)/ModalContext"

const LocationSelector = ({ value, index, onChange }) => {
    const modalFunctions = useContext(ModalContext)
    const [fieldValue, setfieldValue] = useState(value)

    // Have to load this in a special way or leaflet throws errors
    const LocationModal = dynamic(
        () => import("./LocationModal"), {
        ssr: false,
    });

    const updateValue = (value) => {
        document.querySelector('#location').value = JSON.stringify(value)
        value = JSON.stringify(value)
        setfieldValue(value)
        onChange({
            target: {
                value: value,
                dataset: {
                    index: index
                }
            }
        })
    }

    const locationText = () => {
        let parsedVal
        try {
            parsedVal = JSON.parse(fieldValue)
        } catch {
            return ""
        }

        if (parsedVal.name) {
            return <span>{parsedVal.name}</span>
        }

        return <span>
            {parsedVal.lat}<br />
            {parsedVal.lng}
        </span>
    }

    return <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input type='hidden' id='location' name='location' value={value} />
        <span className="material-icons">location_on</span>
        {locationText()}
        <button
            type="button"
            className="tertiary"
            onClick={() => {
                modalFunctions.addModal(
                    "Add location",
                    <LocationModal updateValue={updateValue} value={fieldValue} />
                )
            }}
        >
            {fieldValue && JSON.parse(fieldValue)?.lat && JSON.parse(fieldValue)?.lng ? 'Edit location' : 'Add location'}
        </button>
    </div>
}

export default LocationSelector