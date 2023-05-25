"use client"

import { useState } from "react"
import { createContext } from "react"
import ModalContainer from "@/components/ModalContainer/ModalContainer"

// To use the Modal Context anywhere in the app, we import this context object
export const ModalContext = createContext()

// This provider object goes in the main layout file, to wrap our entire app
export const ModalProvider = ({ children }) => {
  const [modals, setmodals] = useState([])

  const addModal = (title, children) => {
    const id = Math.floor(Math.random() * 90000) + 10000
    const modal = {
      id: id,
      title: title,
      content: children
    }
    setmodals([...modals, modal])
  }

  const popModal = () => {
    setmodals(modals.slice(0, -1))
  }

  const functions = {
    addModal: addModal,
    popModal: popModal
  }

  return (
    <ModalContext.Provider value={functions}>
      {children}
      <ModalContainer modals={modals} />
    </ModalContext.Provider>
  )
}