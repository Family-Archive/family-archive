"use client"

import { useState, createContext, useEffect, useReducer } from "react"
import ToastContainer from "@/components/ToastContainer/ToastContainer"

/**
 * This context provides global functions for creating toast messages
 * Any client component can create modals by invoking this context
 */

export const ToastContext = createContext()

// There's some crazy stuff with state going on here that we have to work around
// for some reason, updating the state in the component doesn't update it in the FUNCTION
// ie, if a child component calls createToast(), the "toastState" value that the function call sees is always whatever the state is initalized to,
// even if the actual state has already been changed to something else
// The result of this is that only one toast can appear at a time, cause every time we call the function it acts as if the object is empty

// So instead, we track toasts in a non-state variable that doesn't have these problems, and then use state in order to pass the value to the prop
// (trying to pass a non-state variable doesn't work because it doesn't re-render)
// I initialize this variable outside of the component here because initalizing it inside causes the same problems as we have with state
// -- it doesn't ever get changed from the initial value.

// And then lastly, we have to call the forceUpdate() function when clearing out toasts to make sure the child has the updated state
let toasts

export const ToastProvider = ({ children }) => {
    const forceUpdate = useReducer(() => ({}), {})[1]
    const [toastState, settoastState] = useState({})

    /**
     * Add a new toast message to the stack
     * @param {string} message: The message to display
     * @param {int} duration: How long the toast should display
     */
    const createToast = (message, duration = 5) => {
        const id = new Date().getTime()
        toasts = { ...toasts, [id]: { message: message, duration: duration } }
        settoastState(toasts)
        forceUpdate()

        setTimeout(clearOldToasts, duration * 1000)
    }

    /**
     * Go through all the toasts and remove any that have been in the object longer than their duration
     */
    const clearOldToasts = () => {
        let tempToasts = toasts
        for (let id in tempToasts) {
            if (new Date().getTime() >= (parseInt(id) + (tempToasts[id].duration * 1000))) {
                delete toasts[id]
            }
        }
        settoastState(toasts)
        forceUpdate()
    }

    const data = {
        createToast: createToast
    }

    return (
        <ToastContext.Provider value={data}>
            {children}
            <ToastContainer toasts={toastState} />
        </ToastContext.Provider>
    )
}