"use client"

import { createContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export const FamilyContext = createContext()

export const FamilyProvider = ({ children }) => {
    const { data: session } = useSession()
    const [family, setfamily] = useState(null)

    const updateFamily = (familyId) => {
        setfamily(familyId)
        document.cookie = `familyId=${familyId}; SameSite=Strict; Path=/;`
        location.reload(true)
    }

    // When the session is initialized, set the current family to what's in the cookie if one is set
    // Otherwise, set it to the defaultfamily value and set the cookie
    useEffect(() => {
        if (!family) {
            if (document.cookie.includes('familyId')) {
                const currFamily = document.cookie.split('familyId=')[1].split(';')[0]
                setfamily(currFamily)
            } else if (session) {
                const currFamily = session.user.defaultFamily.id
                document.cookie = `familyId=${currFamily}; SameSite=Strict; Path=/;`
                setfamily(currFamily)
            }
        }
    }, [session])

    return (
        <FamilyContext.Provider value={{ family: family, setFamily: updateFamily }}>
            {children}
        </FamilyContext.Provider>
    )
}