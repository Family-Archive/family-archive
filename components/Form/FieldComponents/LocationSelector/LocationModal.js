"use client"

import styles from './LocationModal.module.scss'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useState, useContext, useEffect } from 'react'
import { ModalContext } from "@/app/(contexts)/ModalContext"

// Fix missing icon file
import L from 'leaflet';
const icon = L.icon({
    iconUrl: "/icons/map/marker-icon.png",
    iconAnchor: [12, 40]
});

const LocationModal = (props) => {
    const modalFunctions = useContext(ModalContext)

    const [value, setvalue] = useState(props.value ? JSON.parse(props.value) : { lat: null, lng: null, name: null })
    const [map, setmap] = useState(null)
    const [isSearchMode, setisSearchMode] = useState(true)
    const [hasName, sethasName] = useState(props.value && JSON.parse(props.value).name ? true : false)

    /**
     * Update the position of the component:
     * - If the map is accessible, "fly to" the position
     * - Set the field value to the location
     * - Set the lat and lng fields to the location (if possible)
     * If a lat and lng aren't explicitly passed, we will try to get them from the input fields
     * This function is set up this way because it is invoked both from the map to update the fields
     * as well as from the FIELDS, to update the map. Both ways.
     * @param {float} lat: The latitude value
     * @param {float} lng: The longitude value
     */
    const updatePos = (lat = null, lng = null) => {
        if (!lat || !lng) {
            lat = document.querySelector('#lat').value
            lng = document.querySelector('#lng').value
        }
        if (map) {
            map.target.setView([lat, lng], 4, { animation: true })
        }

        setvalue({ 'lat': lat, 'lng': lng })
        if (document.querySelector('#lat')) {
            document.querySelector('#lat').value = lat
            document.querySelector('#lng').value = lng
        }
    }

    /**
     * Use the value in the search field to ask OpenStreetMap for possible location results
     * If we have some, update the component with the lat + lng of the first one in the list
     */
    const getCoordsFromSearch = async () => {
        const query = document.querySelector('#search').value
        let results = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
        results = await results.json()
        if (results) {
            updatePos(results[0].lat, results[0].lon)
        }
    }

    // When the search mode is switched, update the lat + lng fields if necessary
    useEffect(() => {
        if (!isSearchMode && value) {
            document.querySelector('#lat').value = value.lat
            document.querySelector('#lng').value = value.lng
        }
    }, [isSearchMode])

    // When the name boolean is updated to true, set the value + input box to whatever's in the search box if we're in search mode
    // When name is turned off, set it to null
    useEffect(() => {
        if (hasName) {
            if (isSearchMode && document.querySelector('#search').value) {
                setvalue({ ...value, name: document.querySelector('#search').value })
                document.querySelector('#customName').value = document.querySelector('#search').value
            }
        } else {
            setvalue({ ...value, name: null })
        }
    }, [hasName])

    // center-of-the-US-ish
    const initPos = [39.8283, -98.5795]

    return (
        <div className={styles.LocationModal}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'end', marginBottom: '1rem' }}>
                <span>Select via {isSearchMode ? 'location search' : 'coordinates'}</span>
                <div>
                    <input type="checkbox" id='mode' className='toggle' defaultChecked onChange={e => setisSearchMode(e.target.checked)} />
                    <label className='toggle' htmlFor="mode">Toggle</label>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
                {!isSearchMode ?
                    <>
                        <formitem>
                            <label htmlFor='lat'>Latitude</label>
                            <input name='lat' id='lat' type='text' onChange={updatePos} />
                        </formitem>
                        <formitem>
                            <label htmlFor='lng'>Longitude</label>
                            <input name='lng' id='lng' type='text' onChange={updatePos} />
                        </formitem>
                    </>
                    : <>
                        <formitem>
                            <label htmlFor='search'>Search for a location</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input name='search' id='search' type='text' onKeyDown={e => { if (e.key === 'Enter') { getCoordsFromSearch() } }} />
                                <button type='button' onClick={getCoordsFromSearch}>Search</button>
                            </div>
                        </formitem>
                    </>
                }
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 0.5rem 0' }}>
                <input
                    defaultChecked={value.name ? true : false}
                    onClick={(e) => sethasName(e.target.checked)}
                    type='checkbox'
                    id='hasName'
                    name='hasName'
                />
                <label htmlFor='hasName'>Use a name for this location, instead of coordinates?</label>
            </div>

            {hasName ?
                <formitem>
                    <label htmlFor='customName'>Name</label>
                    <input
                        defaultValue={value.name ? value.name : ""}
                        onChange={(e) => setvalue({ ...value, name: e.target.value })}
                        type='text'
                        id='customName'
                        name='customName'
                    />
                    <br /><br />
                </formitem>
                : ""
            }

            <br />
            <MapContainer
                center={value.lat ? [value.lat, value.lng] : initPos}
                zoom={4}
                scrollWheelZoom={true}
                whenReady={(map) => {
                    setmap(map)
                    map.target.on("click", (e) => {
                        updatePos(e.latlng.lat, e.latlng.lng)
                    });
                }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {value.lat ?
                    <Marker icon={icon} position={[value.lat, value.lng]} />
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