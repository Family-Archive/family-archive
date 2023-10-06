"use client"

import { useEffect, useState } from "react"

const DateInput = (props) => {
    const [day, setDay] = useState(null)
    const [month, setMonth] = useState(null)
    const [year, setYear] = useState(null)

    const [hasTime, sethasTime] = useState(false)
    const [hour, sethour] = useState(null)
    const [minute, setminute] = useState(null)

    const setDate = (year, month = null, day = null, hour = null, minute = null) => {
        const newDate = new Date(year, month, day, hour, minute)

        // We want to store the time in UTC, so we subtract the TZ offset if one exists
        // Also, for some reason the initialized time is always 24 hours behind what's specfied, so we add a day
        const offset = newDate.getTimezoneOffset() * 60000;
        newDate.setTime(newDate.getTime() - offset);
        newDate.setDate(newDate.getDate() + 1)

        props.setDate(newDate.getTime(), props.type)
    }

    useEffect(() => {
        if (props.unit == 'days' && day != null && month != null && year != null) {
            if (hasTime && hour != null && minute != null) {
                setDate(year, month, day, hour, minute)
            } else {
                setDate(year, month, day)
            }
        }

        if (props.unit == 'months' && month != null && year != null) {
            setDate(year, month)
        }

        if (props.unit == 'years' && year != null) {
            setDate(year)
        }
    }, [day, month, year, hour, minute, hasTime])

    return (
        <div className="DateInput" style={{ marginBottom: '1rem' }}>
            {props.unit == 'days' ?
                <select name="day" id="day" onChange={e => setDay(e.target.value)}>
                    <option selected disabled>Day</option>
                    {[...Array(31).keys()].map(num => {
                        return <option value={num}>{num + 1}</option>
                    })}
                </select> : ""}

            {props.unit == "months" || props.unit == "days" ?
                <select name="month" id="month" onChange={e => setMonth(e.target.value)}>
                    <option selected disabled>Month</option>
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                </select> : ""}

            <input type='text' name='year' id='year' placeholder="Year" onChange={e => setYear(e.target.value)} />

            {props.type === 'both' ?
                <>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '1rem',
                        marginBottom: '0.5rem'
                    }}>
                        <label for='hasTime'>Did this record occur at a specific time?</label>
                        <input type='checkbox' name='hasTime' onChange={e => sethasTime(!hasTime)} />
                    </div>

                    {hasTime ? <>
                        <select name="hour" id="hour" onChange={e => sethour(e.target.value)}>
                            <option selected disabled>Hour</option>
                            {[...Array(24).keys()].map(num => {
                                return <option value={num}>{num}</option>
                            })}
                        </select>

                        <select name="minute" id="minute" onChange={e => setminute(e.target.value)}>
                            <option selected disabled>Minute</option>
                            {[...Array(60).keys()].map(num => {
                                return <option value={num}>{num}</option>
                            })}
                        </select>
                    </> : ""}
                </>
                : ""}
        </div>
    )
}

export default DateInput