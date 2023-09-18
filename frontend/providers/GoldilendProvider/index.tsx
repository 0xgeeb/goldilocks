"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."
import { getContract } from "@wagmi/core"
import { BeraInfo, GoldilendInitialState } from "../../utils/interfaces"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE: GoldilendInitialState = {
  displayString: '',
  activeToggle: 'loan',
  borrowLimit: 0,
  changeActiveToggle: (_toggle: string) => {},
  checkBeraBalance: async () => {},
  beraArray: [],
  selectedBeras: [],
  handleBorrowChange: (_input: string) => {},
  handleBeraClick: (_bera: BeraInfo) => {},
  findSelectedIdxs: () => [],
  updateBorrowLimit: () => {}
}

const GoldilendContext = createContext(INITIAL_STATE)

export const GoldilendProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)
  const [borrowLimitState, setBorrowLimitState] = useState<number>(INITIAL_STATE.borrowLimit)
  const [beraArrayState, setBeraArrayState] = useState<BeraInfo[]>(INITIAL_STATE.beraArray)
  const [selectedBerasState, setSelectedBerasState] = useState<BeraInfo[]>([])

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

  const handleBorrowChange = (input: string) => {
    setDisplayStringState(input)
    //todo: set number state here
  }

  const checkBeraBalance = async () => {
    if(wallet) {
      const bondBalance = await bondbearContract.read.balanceOf([wallet])
      const bandBalance = await bandbearContract.read.balanceOf([wallet])
      const bondNum = parseFloat(bondBalance.toString())
      const bandNum = parseFloat(bandBalance.toString())
      for(let i = 0; i < bondNum; i++) {
        const bondInfo  = {
          name: "BondBera",
          imageSrc: "https://ipfs.io/ipfs/QmSaVWb15oQ1HcsUjGGkjwHQ1mxJBYeivtBCgHHHiVLt7w",
          valuation: 50,
          index: i
        }
        setBeraArrayState(curr => [...curr, bondInfo])
      }
      for(let i = 0; i < bandNum; i++) {
        const bandInfo  = {
          name: "BandBera",
          imageSrc: "https://ipfs.io/ipfs/QmNWggx9vvBVEHZc6xwWkdyymoKuXCYrJ3zQwwKzocDxRt",
          valuation: 50,
          index: bondNum + i
        }
        setBeraArrayState(curr => [...curr, bandInfo])
      }
    }
  }

  const handleBeraClick = (bera: BeraInfo) => {
    const idxArray: number[] = findSelectedIdxs()
    if(idxArray.includes(bera.index)) {
      setSelectedBerasState(prev => prev.filter(beraf => beraf.index !== bera.index))
    }
    else {
      setSelectedBerasState(prev => [...prev, bera])
    }
  }

  const findSelectedIdxs = (): number[] => {
    let idxArray: number[] = []
    selectedBerasState.forEach((selectedBera) => {
      idxArray.push(selectedBera.index)
    })
    return idxArray
  }

  const updateBorrowLimit = () => {
    let limit = 0
    selectedBerasState.forEach((bera) => {
      limit += bera.valuation
    })
    setBorrowLimitState(limit)
  }

  return (
    <GoldilendContext.Provider
      value={{
        displayString: displayStringState,
        activeToggle: activeToggleState,
        borrowLimit: borrowLimitState,
        beraArray: beraArrayState,
        selectedBeras: selectedBerasState,
        changeActiveToggle,
        checkBeraBalance,
        handleBorrowChange,
        updateBorrowLimit,
        handleBeraClick,
        findSelectedIdxs
      }}
    >
      { children }
    </GoldilendContext.Provider>
  )
}

export const useGoldilend = () => useContext(GoldilendContext)