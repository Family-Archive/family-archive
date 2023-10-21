"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import styles from './Timeline.module.scss'

const Timeline = (props) => {

    const [fontSize, setfontSize] = useState(55)
    const [date, setdate] = useState(null)
    const [mouseDown, setmouseDown] = useState(false)
    const [markerElement, setmarkerElement] = useState(null)
    const [zooming, setzooming] = useState(false)

    const getTimelineBounds = (data) => {
        let startdate = data[0].date.startdate
        let enddate = data[0].date.enddate
        for (let timedata of data) {
            if (timedata.date.startdate < startdate) {
                startdate = timedata.date.startdate
            }
            if (timedata.date.enddate > enddate) {
                enddate = timedata.date.enddate
            }
        }

        // To improve accuracy of month + year zooms,
        // round start date down to beginning of year
        let start = new Date(parseInt(startdate))
        start.setMonth(0)
        start.setDate(0)
        startdate = start.getTime()

        // Round end date up to end of year
        let end = new Date(parseInt(enddate))
        end.setMonth(12)
        end.setDate(31)
        enddate = end.getTime()

        return [startdate, enddate]
    }

    const getMarkerElement = () => {
        if (fontSize < 5) {
            return <div className={`${styles.years} ${styles.markers}`} style={{ width: `${parseInt(numDays / 2)}em` }}>
                {[...Array(parseInt(numYears + 1)).keys()].map(num => {
                    return <div key={num} className={styles.marker} />
                })}
            </div>
        } else if (fontSize <= 30) {
            return <div className={`${styles.months} ${styles.markers}`} style={{ width: `${parseInt(numDays / 2)}em` }}>
                {[...Array(parseInt(numMonths + 1)).keys()].map(num => {
                    return <div key={num} className={styles.marker} />
                })}
            </div>
        } else {
            return <div className={`${styles.days} ${styles.markers}`} style={{ width: `${parseInt(numDays / 2)}em` }}>
                {[...Array(parseInt(numDays - 1)).keys()].map(num => {
                    return <div key={num} className={styles.marker} />
                })}
            </div>
        }
    }

    const changeZoomLevel = (direction) => {
        setzooming(true)
        const timeline = document.querySelector('#timeline')

        const oldFontSize = fontSize
        let newFontSize = fontSize

        if (direction === 'in') {
            if (fontSize <= 21 && fontSize > 2.1) {
                newFontSize = fontSize - 2
            } else if (fontSize <= 2.1 && fontSize > 0) {
                newFontSize = fontSize - 0.2
            } else if (fontSize > 20) {
                newFontSize = fontSize - 10
            }
        } else {
            if (fontSize <= 2) {
                newFontSize = fontSize + 0.2
            }
            else if (fontSize <= 20) {
                newFontSize = fontSize + 2
            } else {
                newFontSize = fontSize + 20
            }
        }

        const pctChange = newFontSize / oldFontSize
        const newLeft = timeline.scrollLeft - (timeline.scrollLeft * pctChange)
        document.querySelector('#timelineContainer').style.left = newLeft + 'px'
        setfontSize(newFontSize)

        window.setTimeout(() => {
            document.querySelector('#timelineContainer').classList.add(styles.noAnim)
            timeline.scrollTo((timeline.scrollLeft * pctChange), timeline.scrollTop)
            document.querySelector('#timelineContainer').style.left = '0px'
            window.setTimeout(() => {
                document.querySelector('#timelineContainer').classList.remove(styles.noAnim)
                setzooming(false)
            }, 50)
        }, 100)
    }

    const getScrollTime = (scrollLeft) => {
        const scrollDistance = scrollLeft / fontSize; // convert px to em
        const scrollDays = scrollDistance * 2 // 0.5 em per day
        const scrollMs = scrollDays * 86400000
        const startDate = bounds[0]
        const datestamp = parseInt(startDate) + parseInt(scrollMs)
        setdate(new Date(datestamp))
    }

    const data = props.data

    // Sort original array by startdate
    data.sort((a, b) => {
        return parseInt(a.date.startdate) - parseInt(b.date.startdate)
    })

    // Create a new list of lists, with each second-dimensional list containing records. This represents each "section" on the timeline
    // Each section contains records next to each other visually. We want to put as many records next to each other as possible without overlap
    let visualData = []

    // For each record, go through each section and compare its start date to the last records' end date. If there's no overlap, add it to the section
    // Otherwise, look at the next section, and so on. If it doesn't fit in any existing sections, create a new one
    for (let record of data) {
        let addedToSection = false
        for (let section of visualData) {
            if (section.slice(-1)[0].date.enddate <= record.date.startdate) {
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
        // Zoom timeline to fit window exactly
        const timeline = document.querySelector('#timeline')
        const ratio = (timeline.clientWidth - 50) / timeline.scrollWidth
        setfontSize(fontSize * ratio)

        // Set timestamps and markers
        setmarkerElement(getMarkerElement)
        getScrollTime(0)

        // Add event listeners related to drag panning
        const setMouseUp = () => { setmouseDown(false) }
        window.addEventListener('pointerup', setMouseUp, false)

        return () => {
            window.removeEventListener('pointerup', setMouseUp, false)
        }
    }, [])

    // We only want to call this function when the fontsize changes to improve performance
    useEffect(() => {
        setmarkerElement(getMarkerElement)
    }, [fontSize, props.data])

    return (
        <div
            id="timeline"
            className={styles.Timeline}
            style={{ fontSize: fontSize }}
            onScroll={(e) => getScrollTime(e.target.scrollLeft)}
            onPointerDown={() => setmouseDown(true)}
            onPointerUp={() => setmouseDown(false)}
            onPointerMove={(e) => {
                if (mouseDown) {
                    document.querySelector('#timeline').scrollLeft -= e.movementX
                    document.querySelector('#timeline').scrollTop -= e.movementY
                }
            }}
        >

            <div className={styles.dateContainer}>
                <div className={`${styles.date}`}>
                    {date ?
                        new Date(date.getTime() + ((63 / fontSize) * 172800000)).toLocaleDateString()
                        : ""
                    }
                </div>
                <div className={`${styles.date} ${styles.center}`}>
                    {date ?
                        // Get current date for left side, get width of element / 2 (cause its halfway over), subtract the offset, divide by fontSize to get ems,
                        // multiply by 2 cause 0.5 em per day, multiply by number of ms in day
                        new Date(date.getTime() + (((document.querySelector('#timeline').clientWidth - 147) / 2) / fontSize) * 172800000).toLocaleDateString()
                        : ""
                    }
                </div>
                <div className={`${styles.date} ${styles.right}`}>
                    {date ?
                        new Date(date.getTime() + ((document.querySelector('#timeline').clientWidth - 50) / fontSize) * 172800000).toLocaleDateString()
                        : ""
                    }
                </div>
            </div>

            <div className={`${styles.zoomControls} ${zooming ? styles.disabled : ''}`}>
                <button
                    className='tertiary'
                    style={{ borderRadius: '99rem 0 0 99rem', borderRight: '1px solid grey' }}
                    onClick={() => changeZoomLevel('out')}
                >
                    <span class="material-icons">zoom_in</span>
                </button>
                <button
                    className='tertiary'
                    style={{ borderRadius: '0 99rem 99rem 0' }}
                    onClick={() => changeZoomLevel('in')}
                >
                    <span class="material-icons">zoom_out</span>
                </button>
            </div>
            <div id='timelineContainer' className={styles.container} style={{ width: `${numDays / 2}em` }} >
                <div className={styles.tlObject} />
                {markerElement}
                <div className={styles.entries}>
                    {visualData.map(section => {
                        return <div className={styles.section}>
                            {section.map(datum => {
                                return <Link href={`/record/${datum.id}`}>
                                    <div
                                        className={styles.entry}
                                        key={datum.date.startdate + datum.date.enddate}
                                        style={{
                                            width: `${(datum.date.enddate - datum.date.startdate) / 86400000 / 2}em`,
                                            marginLeft: `${(datum.date.startdate - bounds[0]) / 86400000 / 2}em`,
                                            filter: `hue-rotate(${(datum.date.startdate * 0.000001 % 9) * 45}deg)`
                                        }}
                                    >
                                        <span>{datum.name}</span>
                                    </div>
                                </Link>
                            })}
                        </div>
                    })}
                </div>
            </div>
        </div>
    )
}

export default Timeline