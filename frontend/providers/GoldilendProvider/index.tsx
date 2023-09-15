"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."
import { formatEther } from "viem"
import { getContract } from "@wagmi/core"
import { GoldilendInitialState } from "../../utils/interfaces"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE: GoldilendInitialState = {
  activeToggle: 'loan',
  changeActiveToggle: (_toggle: string) => {},
  checkBondBalance: async (): Promise<number> => 0,
  checkBandBalance: async (): Promise<number> => 0
}

const GoldilendContext = createContext(INITIAL_STATE)

export const GoldilendProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet } = useWallet()

  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const bondbearContract = getContract({
    address: contracts.bondbear.address as `0x${string}`,
    abi: contracts.bondbear.abi
  })

  const bandbearContract = getContract({
    address: contracts.bandbear.address as `0x${string}`,
    abi: contracts.bandbear.abi
  })

  const changeActiveToggle = (toggle: string) => {
    //todo: add clearing out state here
    // setDisplayStringState('')
    // setBottomDisplayStringState('')
    // setHoneyBuyState(0)
    // setBuyingLocksState(0)
    // setSellingLocksState(0)
    // setGettingHoneyState(0)
    // setRedeemingLocksState(0)
    // setRedeemingHoneyState(0)
    setActiveToggleState(toggle)
  }

  const checkBondBalance = async (): Promise<number> => {
    const bondBalance = await bondbearContract.read.balanceOf([wallet])
    return parseFloat(bondBalance.toString())
  }

  const checkBandBalance = async (): Promise<number> => {
    const bandBalance = await bandbearContract.read.balanceOf([wallet])
    return parseFloat(bandBalance.toString())
  }

  return (
    <GoldilendContext.Provider
      value={{
        activeToggle: activeToggleState,
        changeActiveToggle,
        checkBondBalance,
        checkBandBalance
      }}
    >
      { children }
    </GoldilendContext.Provider>
  )
}

export const useGoldilend = () => useContext(GoldilendContext)