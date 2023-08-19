"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."
import { GoldilendInitialState } from "../../utils/interfaces"

const INITIAL_STATE: GoldilendInitialState = {

}

const GoldilendContext = createContext(INITIAL_STATE)

export const GoldilendProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  return (
    <GoldilendContext.Provider
      value={{

      }}
    >
      { children }
    </GoldilendContext.Provider>
  )
}

export const useGoldilend = () => useContext(GoldilendContext)