import { useContext, useState, useEffect } from "react"
import { ModalContext } from "@/app/(contexts)/ModalContext"
import DateSelectorForm from "./DateSelectorForm"
import clientLib from '@/lib/client/lib'

const DateSelector = ({ value, index, onChange }) => {
    const modalFunctions = useContext(ModalContext)
    const [fieldValue, setfieldValue] = useState(value ? JSON.parse(value) : null)

    const updateValue = value => {
        document.querySelector('#location').value = JSON.stringify(value)
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
            className='tertiary'
            onClick={() => {
                modalFunctions.addModal(
                    "Add date or time",
                    <DateSelectorForm updateValue={updateValue} />
                )
            }}
        >{label}
        </button>
    }

    return <div
        className="DateSelector"
        style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}
    >
        <input type='hidden' name='date' id='date' value={value} />
        <span className="material-icons">calendar_month</span>
        {fieldValue && fieldValue.startdate ? <>
            <b>{clientLib.renderDate(fieldValue.startdate, fieldValue.enddate, fieldValue.unit)}</b>
            {renderUIButton('Edit date')}
        </> :
            renderUIButton('Add date or time')
        }
    </div>
}

export default DateSelector