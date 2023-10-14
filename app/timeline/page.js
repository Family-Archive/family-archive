"use client"

import styles from './timeline.module.scss'
import clientLib from '@/lib/client/lib'

const timeline = () => {

    // some ideas:

    // define all distances in ems instead of px. Then we can change zoom level by setting the em size of the container
    // zoom level should be a state variable with defined numbers. 1, 2, 3, etc. Each zoom level changes the em size
    // PLUS the unit represented by the notches. Zooming too far out it no longer makes sense to mark days, etc

    // somehow need to display all entries on one line UNLESS they overlap. Maybe make all position: absolute in container
    // and use js to determine collision, then add some amount of margin to the top? Will be tricky to be performant

    // probably should sort by length for this! putting all of the shortest ones on the line first means fewer changes needed

    // show date on hover (I don't remember how to get x of mouse hover lol)

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

    const data = [
        { startdate: '1696614670362', enddate: '1696714670362', unit: 'days' },
        { startdate: '1695714670362', enddate: '1696614670362', unit: 'days' },
        { startdate: '1686714670362', enddate: '1697714670362', unit: 'days' },
        { startdate: '1596714670362', enddate: '1696714670362', unit: 'years' }
    ]

    const bounds = getTimelineBounds(data)
    const numDays = (bounds[1] - bounds[0]) / 86400000

    return (
        <div className={styles.timeline}>
            <div className={styles.container} style={{ width: numDays * 5 }} >
                <div className={styles.tlObject} onClick={e => console.log(e.screenX)} />
                <div className={styles.markers}>
                    {[...Array(parseInt(numDays)).keys()].map(num => {
                        return <div className={styles.marker} />
                    })}
                </div>
                <div className={styles.entries}>
                    {data.map(datum => {
                        return <div
                            className={styles.entry}
                            style={{
                                width: (datum.enddate - datum.startdate) / 86400000 * 5,
                                marginLeft: (datum.startdate - bounds[0]) / 86400000 * 5
                            }}
                            onClick={e => {
                                alert(clientLib.renderDate(datum.startdate, datum.enddate, datum.unit))
                            }}
                        />
                    })}
                </div>
            </div>
        </div>
    )
}

export default timeline