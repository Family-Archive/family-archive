"use client"

import { createContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export const FamilyContext = createContext()

/**
 * This context provides the family state to the client
 * The family ID is stored both in this context as well as in a browser cookie, set here
 * This way the family ID can always be accessed from the client (just invoke this context)
 * or the server (look at the cookie)
 */

export const FamilyProvider = ({ children }) => {
    const { data: session } = useSession()
    const [family, setfamily] = useState(null)

    /**
     * Change the family ID by setting the state in this component and by updating the cookie value
     * @param {string} familyId: The ID of the family to switch to
     */
    const updateFamily = (familyId) => {
        setfamily(familyId)
        document.cookie = `familyId=${familyId}; SameSite=Strict; Path=/;`
        window.location = '/'
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