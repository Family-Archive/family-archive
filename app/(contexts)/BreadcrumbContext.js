"use client"

import { createContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export const BreadcrumbContext = createContext()

/**
 * This context displays provides us a persistent breadcrumb trail representing the user's navigation.
 */

export const BreadcrumbProvider = ({ children }) => {
    const pathname = usePathname()
    const [trail, settrail] = useState(() => {
        if (typeof localStorage !== 'undefined' && localStorage.getItem('breadcrumbTrail')) {
            return JSON.parse(localStorage.getItem('breadcrumbTrail'))
        }
        return [{ name: 'Home', path: '/' }]
    })

    // This isn't a normal breadcrumb trail: firstly, many breadcrumb trails are implemented by simply splitting the URL because the route directly relates to the page title --
    // this is not the case here. But furthermore, even if this is not the case, leaf nodes can usually only be reached through a single path; for example, in Moodle,
    // a course always resides in the same category -- the breadcrumb trail can always be calculated on the server based on the database, to provide something like 
    // Home > Courses > Category > Course (for example). In our case, the breadcrumb trail can change based on how the user is navigating the site: a trail could look like
    // Home > Timeline > Record, or the same record could be reached through Home > Collection > Collection Name > Subcollection Name > Record

    // So basically the way we're dealing with this is that we have a route listener on the breadcrumb context that updates the trail contextually when the page changes.
    // Firstly, we have a list of paths that should always cause the trail to reset. Like if a user goes to the All Records, we always reset the trail to Home > All Records.
    // Secondly, if that doesn't apply, we check if any of the existing nodes contain the current path. If so, we split the breadcrumb trail there -- we went backwards.
    // Finally, if these conditions don't apply, we just append a new node to the end of the trail.

    // Also, we store the breadcrumb trail in local storage and try to load it when the component mounts so we don't lose it when the page reloads.

    // List of paths that should reset the trail
    const resetPaths = [
        '/records/all',
        '/collection',
        '/people',
        '/records/timeline',
        '/records/map'
    ]

    /**
     * Given a path that the user has navigated to, alter the breadcrumb path accordingly
     * @param {string} pathname: The page the user has navigated to
     * @returns {null}
     */
    const updateTrail = (pathname) => {
        // Use the last split of the URL as the page name,
        // unless there's an h1.title element on the page -- then use that
        let name = pathname.split('/').slice(-1)
        if (document.querySelector('.title')) {
            name = document.querySelector('.title').innerText
        }

        // Reset path if needed
        if (resetPaths.includes(pathname)) {
            const trail = [{ name: "Home", path: "/" }, { name: name, path: pathname }]
            localStorage.setItem("breadcrumbTrail", JSON.stringify(trail))
            settrail(trail)
            return
        }

        // Split trail at node if we're going backwards
        for (const [index, node] of trail.entries()) {
            if (node.path === pathname) {
                let tempTrail = trail
                tempTrail = tempTrail.slice(0, index + 1)
                localStorage.setItem("breadcrumbTrail", JSON.stringify(tempTrail))
                settrail(tempTrail)
                return
            }
        }

        // Otherwise, push to trail
        let tempTrail = trail
        tempTrail.push({ name: name, path: pathname })
        localStorage.setItem("breadcrumbTrail", JSON.stringify(trail))
        settrail(trail)
    }

    // Watch for path changes and update the breadcrumb trail accordingly
    useEffect(() => {
        updateTrail(pathname)
    }, [pathname])

    return (
        <BreadcrumbContext.Provider value={{ trail: trail, settrail: settrail }}>
            {children}
        </BreadcrumbContext.Provider>
    )
}