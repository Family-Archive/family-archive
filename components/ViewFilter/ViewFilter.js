"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './ViewFilter.module.scss'
import SortToggle from './SortToggle/SortToggle/SortToggle'
import FilterSetting from './FilterSetting/FilterSetting'

const ViewFilter = (props) => {
    const router = useRouter();
    const pathname = usePathname()
    const filterJSON = props.params.filters ? JSON.parse(props.params.filters) : {}

    const [sortSettings, setsortSettings] = useState({
        option: props.params.sort ? props.params.sort : "",
        direction: props.params.dir ? props.params.dir : ""
    })

    const [filters, setfilters] = useState({
        "name": filterJSON.name ? filterJSON.name : [],
        "type": filterJSON.age ? filterJSON.age : [],
    })

    const updateSortSettings = (settings) => {
        setsortSettings({
            option: settings.option,
            direction: settings.direction
        })
    }

    const addFilter = (name, entry) => {
        let entryArray = filters[name]
        entryArray.push(entry)
        setfilters({ ...filters, [name]: entryArray })
    }

    const removeFilter = (name, entry) => {
        let currFilterEntries = filters[name]
        currFilterEntries = currFilterEntries.filter(item => item !== entry)
        setfilters({ ...filters, [name]: currFilterEntries })
    }

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