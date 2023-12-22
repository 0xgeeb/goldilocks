"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."

const INITIAL_STATE = {

}

const PresaleContext = createContext(INITIAL_STATE)

export const PresaleProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  return (
    <PresaleContext.Provider
      value={{

      }}  
    >
      { children }
    </PresaleContext.Provider>
  )
}

export const usePresale = () => useContext(PresaleContext)