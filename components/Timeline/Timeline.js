"use client"

import { useState, useEffect } from 'react'
import styles from './Timeline.module.scss'
import clientLib from '@/lib/client/lib'

const Timeline = (props) => {

    // TODO: connect to real data, and have some way to bring up an info card about each record, or something

    // timeline notches aren't actually accurate for months + years. Days are accurate but months and years don't account for day offset 
    // (ie, first record starts on Aug 6, 2020 has the timeline notch for the year "2020" start at beginning of timeline, halfway through the year)
    // We should round the bounds to the nearest year to account for this.
    // technically this is also true for days because of hr + minute differences but I think we can get away with this.

    // show some data on entry hover

    const [fontSize, setfontSize] = useState(55)
    const [date, setdate] = useState(null)

    const getTimelineBounds = (data) => {
        let startdate = data[0].startdate
        let enddate = data[0].enddate
        for (let timedata of data) {
            if (timedata.startdate < startdate) {
                startdate = timedata.startdate
            }
            if (timedata.enddate > enddate) {
                enddate = timedata.enddate
            }
        }

        return [startdate, enddate]
    }

    const getMarkerElement = () => {
        if (fontSize < 5) {
            return <div className={`${styles.years} ${styles.markers}`}>
                {[...Array(parseInt(numYears)).keys()].map(num => {
                    return <div key={num} className={styles.marker} />
                })}
            </div>
        } else if (fontSize <= 30) {
            return <div className={`${styles.months} ${styles.markers}`}>
                {[...Array(parseInt(numMonths)).keys()].map(num => {
                    return <div key={num} className={styles.marker} />
                })}
            </div>
        } else {
            return <div className={`${styles.days} ${styles.markers}`}>
                {[...Array(parseInt(numDays)).keys()].map(num => {
                    return <div key={num} className={styles.marker} />
                })}
            </div>
        }
    }

    const changeZoomLevel = (direction) => {
        if (direction === 'in') {
            if (fontSize <= 10 && fontSize > 0) {
                setfontSize(fontSize - 1)
            } else if (fontSize > 5) {
                setfontSize(fontSize - 10)
            }
        } else {
            if (fontSize <= 5) {
                setfontSize(fontSize + 1)
            } else {
                setfontSize(fontSize + 10)
            }
        }
    }

    const getScrollTime = (scrollLeft) => {
        const scrollDistance = scrollLeft / fontSize; // convert px to em
        const scrollDays = scrollDistance * 2 // 0.5 em per day
        const scrollMs = scrollDays * 86400000
        const startDate = bounds[0]
        const datestamp = parseInt(startDate) + parseInt(scrollMs)
        setdate(new Date(datestamp))
    }

    const data = [
        { startdate: '1696724670362', enddate: '1697614680362', unit: 'days' },
        { startdate: '1695714670362', enddate: '1696614670362', unit: 'days' },
        { startdate: '1686714670362', enddate: '1697714670362', unit: 'days' },
        { startdate: '1596714770392', enddate: '1696814670362', unit: 'years' },
    ]

    // Sort original array by startdate
    data.sort((a, b) => {
        return parseInt(a.startdate) - parseInt(b.startdate)
    })

    // Create a new list of lists, with each second-dimensional list containing records. This represents each "section" on the timeline
    // Each section contains records next to each other visually. We want to put as many records next to each other as possible without overlap
    let visualData = []

    // For each record, go through each section and compare its start date to the last records' end date. If there's no overlap, add it to the section
    // Otherwise, look at the next section, and so on. If it doesn't fit in any existing sections, create a new one
    for (let record of data) {
        let addedToSection = false
        for (let section of visualData) {
            if (section.slice(-1)[0].enddate <= record.startdate) {
                section.push(record)
                addedToSection = true
                break
            }
        }
        if (!addedToSection) {
            visualData.push([record])
        }
    }

    const bounds = getTimelineBounds(data)

    const numDays = (bounds[1] - bounds[0]) / 86400000
    const numMonths = (bounds[1] - bounds[0]) / 2629800000 // approximation since not all months are the same length
    const numYears = (bounds[1] - bounds[0]) / 31556952000

    useEffect(() => {
        getScrollTime(0)
    }, [])

    return (
        <div
            className={styles.Timeline}
            style={{ fontSize: fontSize }}
            onScroll={(e) => getScrollTime(e.target.scrollLeft)}
        >
            <div className={styles.date}>{date ? date.toLocaleDateString() : ""}</div>
            <div className={styles.zoomControls}>
                <button className='tertiary' onClick={() => changeZoomLevel('out')}><span class="material-icons">zoom_in</span></button>
                <button className='tertiary' onClick={() => changeZoomLevel('in')}><span class="material-icons">zoom_out</span></button>
            </div>
            <div className={styles.container} style={{ width: `${numDays / 2}em` }} >
                <div className={styles.tlObject} onClick={e => console.log(e.screenX)} />
                {getMarkerElement()}
                <div className={styles.entries}>
                    {visualData.map(section => {
                        return <div className={styles.section}>
                            {section.map(datum => {
                                return <div
                                    className={styles.entry}
                                    key={datum.startdate + datum.enddate}
                                    style={{
                                        width: `${(datum.enddate - datum.startdate) / 86400000 / 2}em`,
                                        marginLeft: `${(datum.startdate - bounds[0]) / 86400000 / 2}em`,
                                        filter: `hue-rotate(${(datum.startdate % 9) * 45}deg)`
                                    }}
                                    onClick={e => {
                                        alert(clientLib.renderDate(datum.startdate, datum.enddate, datum.unit))
                                    }}
                                />
                            })}
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default Timeline