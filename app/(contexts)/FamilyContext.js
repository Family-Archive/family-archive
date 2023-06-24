"use client"

import { createContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export const FamilyContext = createContext()

export const FamilyProvider = ({ children }) => {
    const { data: session } = useSession()
    const [family, setfamily] = useState(null)

    // When we initialize the component, set the initial family value to the family state if it's set (idk just in case)
    // If not, set it to the default family value from the database
    let currFamily = null
    if (family) {
        currFamily = family
    } else if (session) {
        currFamily = session.user.defaultFamily.id
    }

    const updateFamily = async (familyId) => {
        localStorage.setItem('currFamily', familyId)
        setfamily(familyId)
    }

    // Once the client is loaded, set the family to whatever's stored in localStorage, if exists
    // TODO: Make sure this works with loading ie records that there isn't a race condition here, that the correct family's records are loaded
    useEffect(() => {
        const currFamily = localStorage.getItem('currFamily')
        if (currFamily) {
            setfamily(currFamily)
        }
    }, [])


    return (
        <FamilyContext.Provider value={{ family: currFamily, setFamily: updateFamily }}>
            {children}
        </FamilyContext.Provider>
    )
}