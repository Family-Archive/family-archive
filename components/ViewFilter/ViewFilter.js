"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './ViewFilter.module.scss'
import SortToggle from './SortToggle/SortToggle/SortToggle'

const ViewFilter = (props) => {
    const router = useRouter();
    const pathname = usePathname()

    const [sortSettings, setsortSettings] = useState({
        option: props.params.sort ? props.params.sort : "name",
        direction: props.params.dir ? props.params.dir : "asc"
    })

    const updateSortSettings = (settings) => {
        setsortSettings({
            option: settings.option,
            direction: settings.direction
        })
    }

    useEffect(() => {
        router.replace(`${pathname}?sort=${sortSettings.option}&dir=${sortSettings.direction}`);
        router.refresh()
    }, [sortSettings])


    return (
        <div className={styles.ViewFilter}>
            <section className={styles.sortOptions}>
                <span className={styles.sectionHead}>Sort by</span>
                <SortToggle option="Name" settings={sortSettings} updateSortSettings={updateSortSettings} />
                <SortToggle option="Date" settings={sortSettings} updateSortSettings={updateSortSettings} />
            </section>

            <section className={styles.filterOptions}>
                <span className={styles.sectionHead}>Filter by</span>
            </section>
        </div>
    )
}

export default ViewFilter