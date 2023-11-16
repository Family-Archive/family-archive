import { useEffect, useState } from "react"
import DateInput from "./DateInput"
import { useContext } from "react"
import { ModalContext } from "@/app/(contexts)/ModalContext"

import styles from './DateSelectorForm.module.scss'

const DateSelector = (props) => {
    const modalFunctions = useContext(ModalContext)

    const [isRange, setisRange] = useState(null)
    const [unit, setunit] = useState(null)

    const [startdate, setstartdate] = useState(null)
    const [enddate, setenddate] = useState(null)

    useEffect(() => {
        props.updateValue({ startdate: startdate, enddate: enddate, unit: unit || 'days' })
    }, [startdate, enddate])

    const setDate = (date, type) => {
        if (type === 'start') {
            setstartdate(date)
        } else if (type === 'end') {
            setenddate(date)
        } else {
            setstartdate(date)
            setenddate(date)
        }
    }

    const getContent = () => {
        if (isRange == null) {
            return <div className={styles.rangeChooser}>
                <span>Did this record occur on a specific date or time, or did it span a range of time?</span>
                <button type="button" className="tertiary" onClick={() => setisRange(false)}>
                    <span class="material-icons">event</span>
                    Specific date or time
                </button>
                <button type="button" className="tertiary" onClick={() => setisRange(true)}>
                    <span class="material-icons">toll</span>
                    Range of time
                </button>
            </div>
        }

        if (!isRange) {
            return <>
                <DateInput setDate={setDate} type='both' unit='days' />
                <button type="button" onClick={modalFunctions.clearModalStack}>Ok</button>
            </>
        }

        if (unit == null) {
            return <>
                <span>What unit of time does this record span?</span>
                <div className={styles.unitChooser}>
                    <button type="button" className="tertiary" onClick={() => setunit('days')}>Days</button>
                    <button type="button" className="tertiary" onClick={() => setunit('months')}>Months</button>
                    <button type="button" className="tertiary" onClick={() => setunit('years')}>Years</button>
                </div>
            </>
        }

        return <>
            <span>Start date</span>
            <DateInput setDate={setDate} type='start' unit={unit} />
            <span>End date</span>
            <DateInput setDate={setDate} type='end' unit={unit} />
            <button type="button" onClick={modalFunctions.clearModalStack}>Ok</button>
        </>
    }

    return <div className={styles.DateSelectorForm}>
        {getContent()}
    </div>
}

export default DateSelector