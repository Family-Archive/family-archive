"use client"

import { createContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export const DraftContext = createContext()

/**
 * This context provides a persistent count of the number of drafts in the system
 * It is used to display the notification icon on the Drafts button
 */

export const DraftProvider = ({ children }) => {
    const pathname = usePathname()
    const [numDraftFiles, setnumDraftFiles] = useState(0)

    /**
     * Fetch the current number of drafts from the DB
     */
    const updateCount = async () => {
        let drafts = await fetch(`/api/drafts`)
        drafts = await drafts.json()
        if (drafts.status != 'error') {
            setnumDraftFiles(drafts.data.records.length)
        }
    }

    // Re-fetch the number of drafts every page load
    useEffect(() => {
        updateCount(pathname)
    }, [pathname])

    return (
        <DraftContext.Provider value={{ count: numDraftFiles }}>
            {children}
        </DraftContext.Provider>
    )
}