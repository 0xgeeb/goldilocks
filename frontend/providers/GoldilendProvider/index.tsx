"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."
import { getContract } from "@wagmi/core"
import { GoldilendInitialState } from "../../utils/interfaces"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE: GoldilendInitialState = {
  activeToggle: 'loan',
  changeActiveToggle: (_toggle: string) => {},
  checkBeraBalance: async () => {},
  beraArray: []
}

const GoldilendContext = createContext(INITIAL_STATE)

export const GoldilendProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet } = useWallet()

  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)
  const [beraArrayState, setBeraArrayState] = useState<string[]>(INITIAL_STATE.beraArray)

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

  const checkBeraBalance = async () => {
    if(wallet) {
      const bondBalance = await bondbearContract.read.balanceOf([wallet])
      const bandBalance = await bandbearContract.read.balanceOf([wallet])
      const bondNum = parseFloat(bondBalance.toString())
      const bandNum = parseFloat(bandBalance.toString())
      for(let i = 0; i < bondNum; i++) {
        setBeraArrayState(curr => [...curr, 'https://ipfs.io/ipfs/QmSaVWb15oQ1HcsUjGGkjwHQ1mxJBYeivtBCgHHHiVLt7w'])
      }
      for(let i = 0; i < bandNum; i++) {
        setBeraArrayState(curr => [...curr, 'https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt'])
      }
    }
  }

  return (
    <GoldilendContext.Provider
      value={{
        activeToggle: activeToggleState,
        beraArray: beraArrayState,
        changeActiveToggle,
        checkBeraBalance
      }}
    >
      { children }
    </GoldilendContext.Provider>
  )
}

export const useGoldilend = () => useContext(GoldilendContext)