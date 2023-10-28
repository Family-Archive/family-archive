"use client"
import styles from './RecordMap.module.scss'

import Link from 'next/link'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Fix missing icon file
import L from 'leaflet';
const icon = L.icon({
    iconUrl: "/icons/map/marker-icon.png",
    iconAnchor: [12, 40]
});

const RecordMap = (props) => {
    return (
        <div className={styles.RecordMap}>
            <div className={styles.mapContainer} id='mapContainer'>
                <MapContainer
                    center={[39.8283, -98.5795]}
                    zoom={4}
                    scrollWheelZoom={true}
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
        </div>
    )
}

export default RecordMap