import styles from './LocationModal.module.scss'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState } from 'react'

const LocationModal = () => {

    const [value, setvalue] = useState(null)
    const [marker, setmarker] = useState(null)
    const [map, setmap] = useState(null)

    const addMarker = (e) => {
        setmarker({ 'lat': e.latlng.lat, 'lng': e.latlng.lng })
        setvalue({ 'lat': e.latlng.lat, 'lng': e.latlng.lng })
        document.querySelector('#lat').value = e.latlng.lat
        document.querySelector('#lng').value = e.latlng.lng
    }

    const setPos = () => {
        const lat = document.querySelector('#lat')
        const lng = document.querySelector('#lng')
        map.flyTo([lat, lng])
    }

    const initPos = [39.8283, 98.5795]

    return (
        <div className={styles.LocationModal}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <formitem>
                    <label htmlFor='lat'>Latitude</label>
                    <input name='lat' id='lat' type='text' onChange={setPos} />
                </formitem>
                <formitem>
                    <label htmlFor='lng'>Longitude</label>
                    <input name='lng' id='lng' type='text' onChange={setPos} />
                </formitem>
            </div>

            <br />
            <MapContainer
                center={initPos}
                zoom={13}
                scrollWheelZoom={false}
                whenCreated={map => { setmap(map); console.log(map); console.log('bruh') }}
                whenReady={(map) => {
                    map.target.on("click", (e) => {
                        addMarker(e)
                    });
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {marker ?
                    <Marker position={[marker.lat, marker.lng]} />
                    : ""
                }

            </MapContainer>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type='button'>Ok</button>
                <button type='button' className='tertiary'>Cancel</button>
            </div>
        </div>
    )
}

export default LocationModal