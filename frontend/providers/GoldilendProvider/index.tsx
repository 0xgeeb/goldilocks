"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useWallet } from ".."
import { getContract } from "@wagmi/core"
import { BeraInfo, GoldilendInitialState } from "../../utils/interfaces"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE: GoldilendInitialState = {
  loanAmount: 0,
  displayString: '',
  activeToggle: 'loan',
  borrowLimit: 0,
  loanExpiration: '',
  changeActiveToggle: (_toggle: string) => {},
  checkBeraBalance: async () => {},
  beraArray: [],
  selectedBeras: [],
  handleBorrowChange: (_input: string) => {},
  handleDateChange: (_input: string) => {},
  handleBeraClick: (_bera: BeraInfo) => {},
  findSelectedIdxs: () => [],
  updateBorrowLimit: () => {},
  loanPopupToggle: false,
  setLoanPopupToggle: (_bool: boolean) => {}
}

const GoldilendContext = createContext(INITIAL_STATE)

export const GoldilendProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  const [loanAmountState, setLoanAmountState] = useState<number>(INITIAL_STATE.loanAmount)
  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)
  const [borrowLimitState, setBorrowLimitState] = useState<number>(INITIAL_STATE.borrowLimit)
  const [loanExpirationState, setLoanExpirationState] = useState<string>(INITIAL_STATE.loanExpiration)
  const [beraArrayState, setBeraArrayState] = useState<BeraInfo[]>(INITIAL_STATE.beraArray)
  const [selectedBerasState, setSelectedBerasState] = useState<BeraInfo[]>([])
  const [loanPopupToggleState, setLoanPopupToggleState] = useState<boolean>(INITIAL_STATE.loanPopupToggle)

  const bondbearContract = getContract({
    address: contracts.bondbear.address as `0x${string}`,
    abi: contracts.bondbear.abi
  })

  const bandbearContract = getContract({
    address: contracts.bandbear.address as `0x${string}`,
    abi: contracts.bandbear.abi
  })

  const changeActiveToggle = (toggle: string) => {
    setDisplayStringState('')
    setLoanAmountState(0)
    setActiveToggleState(toggle)
  }

  const handleBorrowChange = (input: string) => {
    setDisplayStringState(input)
    !input ? setLoanAmountState(0) : setLoanAmountState(parseFloat(input))
  }

  const handleDateChange = (input: string) => {
    setLoanExpirationState(input)
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
        loanAmount: loanAmountState,
        displayString: displayStringState,
        activeToggle: activeToggleState,
        borrowLimit: borrowLimitState,
        loanExpiration: loanExpirationState,
        beraArray: beraArrayState,
        selectedBeras: selectedBerasState,
        loanPopupToggle: loanPopupToggleState,
        setLoanPopupToggle: setLoanPopupToggleState,
        changeActiveToggle,
        checkBeraBalance,
        handleBorrowChange,
        handleDateChange,
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