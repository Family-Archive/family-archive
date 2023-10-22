import { useContext, useEffect, useState } from "react"
import { ModalContext } from "@/app/(contexts)/ModalContext"
import LocationModal from "./LocationModal"

const LocationSelector = ({ value, index, onChange }) => {
    const modalFunctions = useContext(ModalContext)
    const [fieldValue, setfieldValue] = useState(value)

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

    return <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
        <input type='hidden' id='location' name='location' value={value} />
        <span className="material-icons">location_on</span>
        {fieldValue && JSON.parse(fieldValue)?.lat && JSON.parse(fieldValue)?.lng ? <div>
            {JSON.parse(fieldValue).lat}<br />{JSON.parse(fieldValue).lng}
        </div>
            : ""
        }
        <button
            type="button"
            className="tertiary"
            onClick={() => {
                modalFunctions.addModal(
                    "Add location",
                    <LocationModal updateValue={updateValue} />
                )
            }}
        >
            {fieldValue && JSON.parse(fieldValue)?.lat && JSON.parse(fieldValue)?.lng ? 'Edit location' : 'Add location'}
        </button>
    </div>
}

export default LocationSelector