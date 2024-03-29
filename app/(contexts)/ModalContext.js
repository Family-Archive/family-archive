"use client"

import { useState } from "react"
import { createContext } from "react"
import ModalContainer from "@/components/ModalContainer/ModalContainer"

/**
 * This context provides global functions for creating and managing modals
 * Any client component can create modals by invoking this context
 */

// To use the Modal Context anywhere in the app, we import this context object
export const ModalContext = createContext()

// This provider object goes in the main layout file, to wrap our entire app
export const ModalProvider = ({ children }) => {
  const [modals, setmodals] = useState([])

  /**
   * Add a new modal to the webpage
   * @param {string} title: The title to show at the top of the modal 
   * @param {jsx} children: The jsx to render as the body of the modal
   * @param {*} styles: Styles to apply to the modal
   */
  const addModal = (title, children, styles = '') => {
    const id = Math.floor(Math.random() * 90000) + 10000
    const modal = {
      id: id,
      title: title,
      content: children,
      styles: styles
    }
    setmodals([...modals, modal])
  }

  /**
   * Remove the top modal from the stack
   */
  const popModal = () => {
    setmodals(modals.slice(0, -1))
  }

  /**
   * Close all modals
   */
  const clearModalStack = () => {
    setmodals([])
  }

  const functions = {
    addModal: addModal,
    popModal: popModal,
    clearModalStack: clearModalStack
  }

  return (
    <ModalContext.Provider value={functions}>
      {children}
      <ModalContainer modals={modals} />
    </ModalContext.Provider>
  )
}