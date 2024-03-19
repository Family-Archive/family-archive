"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import styles from './PageSelector.module.scss'

/**
 * This component maintains a page number state and allows us to increase or decrease the page number.
 * Number changes are reflected in the URL
 */

const PageSelector = ({ page, numPages }) => {
    const router = useRouter();
    const pathname = usePathname()

    const [currentPage, setcurrentPage] = useState(page || 1)
    const [hasLoaded, sethasLoaded] = useState(false)

    // useEffect(() => {
    //     const urlParams = new URLSearchParams(window.location.search)
    //     for (let [key, value] of urlParams) {
    //         if (key == "page") {
    //             return
    //         }
    //     }
    //     setcurrentPage(1)
    // }, [router.pathname])

    useEffect(() => {
        if (!hasLoaded || isNaN(currentPage)) {
            sethasLoaded(true)
            return
        }

        if (currentPage <= 0) {
            setcurrentPage(1)
            return
        }

        if (currentPage > numPages) {
            setcurrentPage(numPages)
            return
        }

        const urlParams = new URLSearchParams(window.location.search)
        let queryString = "?"
        for (let [key, value] of urlParams) {
            if (key !== "page") {
                queryString += `${key}=${value}&`
            }
        }
        queryString += `page=${currentPage}`
        router.replace(`${pathname}${queryString}`);
        router.refresh()
    }, [currentPage])

    return (
        <div className={styles.PageSelector}>
            <button
                className="material-icons secondary"
                disabled={currentPage >= 2 ? "" : "disabled"}
                onClick={() => setcurrentPage(1)}
            >
                keyboard_double_arrow_left
            </button>
            <button
                className={`material-icons secondary ${styles.large}`}
                disabled={currentPage >= 2 ? "" : "disabled"}
                onClick={() => setcurrentPage(currentPage - 1)}
            >
                keyboard_arrow_left
            </button>

            <input
                className={styles.pageNumber}
                type="number"
                value={currentPage}
                id='pageNum'
                onChange={(e) => setcurrentPage(parseInt(e.target.value))}
            />

            <button
                className={`material-icons secondary ${styles.large}`}
                disabled={currentPage == numPages ? "disabled" : ""}
                onClick={() => setcurrentPage(currentPage === numPages ? numPages : currentPage + 1)}
            >
                keyboard_arrow_right
            </button>
            <button
                className="material-icons secondary"
                disabled={currentPage == numPages ? "disabled" : ""}
                onClick={() => setcurrentPage(numPages)}
            >
                keyboard_double_arrow_right
            </button>
        </div>
    )
}

export default PageSelector