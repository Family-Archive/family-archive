import { useContext, useState } from "react"
import { ModalContext } from "@/app/(contexts)/ModalContext"
import DateSelectorForm from "./DateSelectorForm"

const DateSelector = ({ value, index, onChange }) => {
    const modalFunctions = useContext(ModalContext)
    const [fieldValue, setfieldValue] = useState(null)

    const updateValue = value => {
        setfieldValue(value)
        onChange({
            target: {
                value: JSON.stringify(value),
                dataset: { index: index }
            }
        })
    }

    const renderUIButton = label => {
        return <button
            type="button"
            onClick={() => {
                modalFunctions.addModal(
                    "Add date or time",
                    <DateSelectorForm updateValue={updateValue} />
                )
            }}
        >{label}
        </button>
    }

    return <div className="DateSelector">
        {fieldValue ? <>
            {fieldValue.startdate}
            {renderUIButton('Edit date')}
        </> :
            renderUIButton('Add date or time')
        }
    </div>
}

export default DateSelector