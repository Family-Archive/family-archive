import styles from './LocationModal.module.scss'
import { MapContainer, TileLayer, Marker, uesMap, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useContext } from 'react'
import { ModalContext } from "@/app/(contexts)/ModalContext"


// Fix missing icon file
import L from 'leaflet';
const icon = L.icon({
    iconUrl: "/icons/map/marker-icon.png",
    iconAnchor: [12, 40]
});

const LocationModal = (props) => {
    const modalFunctions = useContext(ModalContext)

    const [value, setvalue] = useState(null)
    const [marker, setmarker] = useState(null)
    const [map, setmap] = useState(null)

    const addMarker = (e) => {
        setmarker({ 'lat': e.latlng.lat, 'lng': e.latlng.lng })
        setvalue({ 'lat': e.latlng.lat, 'lng': e.latlng.lng })
        document.querySelector('#lat').value = e.latlng.lat
        document.querySelector('#lng').value = e.latlng.lng
    }

    const updatePos = () => {
        const lat = document.querySelector('#lat').value
        const lng = document.querySelector('#lng').value
        map.target.flyTo([lat, lng])
        setmarker({ 'lat': lat, 'lng': lng })
        setvalue({ 'lat': lat, 'lng': lng })
    }

    const initPos = [39.8283, -98.5795]

    return (
        <div className={styles.LocationModal}>
            <div style={{ display: 'flex', gap: '1rem' }}>
                <formitem>
                    <label htmlFor='lat'>Latitude</label>
                    <input name='lat' id='lat' type='text' onChange={updatePos} />
                </formitem>
                <formitem>
                    <label htmlFor='lng'>Longitude</label>
                    <input name='lng' id='lng' type='text' onChange={updatePos} />
                </formitem>
            </div>

            <br />
            <MapContainer
                center={initPos}
                zoom={4}
                scrollWheelZoom={false}
                whenReady={(map) => {
                    setmap(map)
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
                    <Marker icon={icon} position={[marker.lat, marker.lng]} />
                    : ""
                }

            </MapContainer>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button type='button' onClick={() => { modalFunctions.popModal(); props.updateValue(value) }}>Ok</button>
                <button type='button' className='tertiary' onClick={modalFunctions.popModal}>Cancel</button>
            </div>
        </div>
    )
}

export default LocationModal