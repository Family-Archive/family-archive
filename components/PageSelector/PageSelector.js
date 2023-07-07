"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './PageSelector.module.scss'

const PageSelector = () => {
    const router = useRouter();
    const pathname = usePathname()

    const [page, setpage] = useState(1)
    const [hasLoaded, sethasLoaded] = useState(false)

    useEffect(() => {
        if (!hasLoaded) {
            sethasLoaded(true)
            return
        }

        if (page <= 0 || isNaN(page)) {
            setpage(1)
            return
        }

        const urlParams = new URLSearchParams(window.location.search)
        let queryString = "?"
        for (let [key, value] of urlParams) {
            if (key !== "page") {
                queryString += `${key}=${value}&`
            }
        }
        queryString += `page=${page}`
        router.replace(`${pathname}${queryString}`);
        router.refresh()
    }, [page])

    return (
        <div className={styles.PageSelector}>
            <button className="material-icons secondary" disabled={page >= 2 ? "" : "disabled"} onClick={() => setpage(1)}>keyboard_double_arrow_left</button>
            <button className={`material-icons secondary ${styles.large}`} disabled={page >= 2 ? "" : "disabled"} onClick={() => setpage(page - 1)}>keyboard_arrow_left</button>

            <input
                className={styles.pageNumber}
                type="number"
                value={page}
                onChange={(e) => setpage(parseInt(e.target.value))}
            />

            <button className={`material-icons secondary ${styles.large}`} onClick={() => setpage(page + 1)}>keyboard_arrow_right</button>
            <button className="material-icons secondary" onClick={() => setpage(999)}>keyboard_double_arrow_right</button>
        </div>
    )
}

export default PageSelector