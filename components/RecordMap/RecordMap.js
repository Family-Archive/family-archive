"use client"
import styles from './RecordMap.module.scss'

import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useEffect, useState } from 'react'
import 'leaflet/dist/leaflet.css'

import ViewFilter from '../ViewFilter/ViewFilter'

// Fix missing icon file
import L from 'leaflet';
const icon = L.icon({
    iconUrl: "/icons/map/marker-icon.png",
    iconAnchor: [12, 40]
});

const RecordMap = (props) => {
    const [map, setmap] = useState(null)

    return (
        <div className={styles.RecordMap}>
            <div className={styles.mapContainer} id='mapContainer'>
                <MapContainer
                    center={[39.8283, -98.5795]}
                    zoom={4}
                    scrollWheelZoom={true}
                    whenReady={(map) => {
                        setmap(map)
                    }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {props.data.map(record => {
                        return <Marker icon={icon} position={[record.location.lat, record.location.lng]}>
                            <Popup>
                                <b>{record.name}</b><br />
                                {record.location.name ? record.location.name : <span>{record.location.lat}<br />{record.location.lng}</span>}<br />
                                <Link href={`/record/${record.id}`}>View record</Link>
                            </Popup>
                        </Marker>
                    })
                    }

                </MapContainer>
            </div>

            <div class={styles.sidebar}>
                <ViewFilter params={props.params} sortOptions={false} />
                <div className={styles.recordList}>
                    {props.data.length ?
                        props.data.map((record, index) => {
                            return <div className={styles.listRecordContainer}>
                                <button
                                    className={`${styles.record} tertiary`}
                                    onClick={() => {
                                        map.target.flyTo([record.location.lat, record.location.lng])
                                    }}
                                >
                                    <div>
                                        <span className={styles.title}>{record.name ? record.name : "{no title}"}</span>
                                        <span>{record.location.name ? record.location.name : <>{record.location.lat}<br />{record.location.lng}</>}</span>
                                    </div>
                                    <Link className={styles.link} href={`/record/${record.id}`}>View record</Link>
                                </button>
                            </div>
                        })
                        : "No records found!"
                    }
                </div>
            </div>
        </div >
    )
}

export default RecordMap