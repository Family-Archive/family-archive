"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './ViewFilter.module.scss'
import SortToggle from './SortToggle/SortToggle/SortToggle'
import FilterSetting from './FilterSetting/FilterSetting'

const ViewFilter = (props) => {
    // This component manages state for sorting and filtering options. While it can be used on any page,
    // the page itself must pass the query params down to this component.
    // The way it works is that it has a useEffect hook that watches the sort and filter settings for changes; when a change occurs,
    // it appends the relevant query string to the URL and calls router.refresh(). This causes Next.js to re-fetch the data using the updated query parameters.
    // So in other words, what gets displayed on the front end is ACTUALLY controlled by the URL parameters,not the state, although the state changes are what updates the URL.

    const router = useRouter();
    const pathname = usePathname()

    // Grab the filter options as JSON, if possible
    const filterJSON = props.params.filters ? JSON.parse(props.params.filters) : {}

    // If this stuff is set in the URL, set the state to those values. Otherwise leave it blank.
    const [sortSettings, setsortSettings] = useState({
        option: props.params.sort ? props.params.sort : "",
        direction: props.params.dir ? props.params.dir : ""
    })
    const [filters, setfilters] = useState({
        "name": filterJSON.name ? filterJSON.name : [],
        "type": filterJSON.age ? filterJSON.age : [],
    })

    /**
     * Update the sort settings state
     * @param {object} settings: The settings object to update the state to
     */
    const updateSortSettings = (settings) => {
        setsortSettings({
            option: settings.option,
            direction: settings.direction
        })
    }

    /**
     * Add a new filter entry
     * @param {string} name: The name/type of filter to add
     * @param {string} entry: The value of the filter
     */
    const addFilter = (name, entry) => {
        let entryArray = filters[name]
        entryArray.push(entry)
        setfilters({ ...filters, [name]: entryArray })
    }

    /**
     * Remove a filter entry
     * @param {string} name: The name/type of filter to add
     * @param {string} entry: The value of the filter
     */
    const removeFilter = (name, entry) => {
        let currFilterEntries = filters[name]
        currFilterEntries = currFilterEntries.filter(item => item !== entry)
        setfilters({ ...filters, [name]: currFilterEntries })
    }

    // Watch the sort and filter settings for changes; when a change occurs, convert this into a query string and add it to the URL
    // Then call router.refresh, which re-fetches the data using the new URL string
    useEffect(() => {
        const filterString = JSON.stringify(filters)
        router.replace(`${pathname}?sort=${sortSettings.option}&dir=${sortSettings.direction}&filters=${filterString}`);
        router.refresh()
    }, [sortSettings, filters])

    return (
        <div className={styles.ViewFilter}>
            <section className={styles.sortOptions}>
                <span className={styles.sectionHead}>Sort by</span>
                <SortToggle option="Name" settings={sortSettings} updateSortSettings={updateSortSettings} />
                <SortToggle option="Date" settings={sortSettings} updateSortSettings={updateSortSettings} />
            </section>

            <section className={styles.filterOptions}>
                <span className={styles.sectionHead}>Filter by</span>
                {Object.keys(filters).map(filter => {
                    return <FilterSetting
                        name={filter}
                        key={filter}
                        entries={filters[filter]}
                        addFilter={addFilter}
                        removeFilter={removeFilter}
                    />
                })}
            </section>
        </div>
    )
}

export default ViewFilter