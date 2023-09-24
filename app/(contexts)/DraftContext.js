"use client"

import { createContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export const DraftContext = createContext()

export const DraftProvider = ({ children }) => {
    const pathname = usePathname()
    const [numDraftFiles, setnumDraftFiles] = useState(0)

    const updateCount = async () => {
        let drafts = await fetch(`/api/drafts`)
        drafts = await drafts.json()
        setnumDraftFiles(drafts.data.records.length)
    }

    useEffect(() => {
        updateCount(pathname)
    }, [pathname])

    return (
        <DraftContext.Provider value={{ count: numDraftFiles }}>
            {children}
        </DraftContext.Provider>
    )
}