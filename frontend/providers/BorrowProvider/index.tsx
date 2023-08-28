"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { formatEther } from "viem"
import { getContract } from "@wagmi/core"
import { useWallet } from ".."
import { contracts } from "../../utils/addressi"
import { BorrowingInitialState, BorrowInfo } from "../../utils/interfaces"

const INITIAL_STATE: BorrowingInitialState = {
  borrowInfo: {
    fsl: 0,
    supply: 0,
    honeyBorrowAllowance: 0
  },

  borrow: 0,
  repay: 0,
  setBorrow: (_borrow: number) => {},
  setRepay: (_repay: number) => {},

  displayString: '',
  setDisplayString: (_displayString: string) => {},

  activeToggle: 'borrow',
  changeActiveToggle: (_toggle: string) => {},

  borrowPopupToggle: false,
  setBorrowPopupToggle: (_bool: boolean) => {},

  handlePercentageButtons: (_action: number) => {},
  renderLabel: () => '',
  handleChange: (_input: string) => {},
  handleBalance: () => '',

  refreshBorrowInfo: async () => {}
}

const BorrowContext = createContext(INITIAL_STATE)

export const BorrowProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet } = useWallet()

  const [borrowInfoState, setBorrowInfoState] = useState<BorrowInfo>(INITIAL_STATE.borrowInfo)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const [displayStringState, setDisplayStringState] = useState<string>(INITIAL_STATE.displayString)

  const [borrowState, setBorrowState] = useState<number>(INITIAL_STATE.borrow)
  const [repayState, setRepayState] = useState<number>(INITIAL_STATE.repay)

  const [borrowPopupToggleState, setBorrowPopupToggleState] = useState<boolean>(INITIAL_STATE.borrowPopupToggle)


  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })
  
  const gammContract = getContract({
    address: contracts.gamm.address as `0x${string}`,
    abi: contracts.gamm.abi
  })
  
  const porridgeContract = getContract({
    address: contracts.porridge.address as `0x${string}`,
    abi: contracts.porridge.abi
  })
  
  const borrowContract = getContract({
    address: contracts.borrow.address as `0x${string}`,
    abi: contracts.borrow.abi
  })

  const changeActiveToggle = (toggle: string) => {
    setDisplayStringState('')
    setBorrowState(0)
    setRepayState(0)
    setActiveToggleState(toggle)
  }

  const handlePercentageButtons = (action: number) => {
    const borrowTemp = (balance.staked - balance.locked) * (borrowInfoState.fsl / borrowInfoState.supply)
    if(action == 1) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState((borrowTemp / 4).toFixed(2))
        setBorrowState(borrowTemp / 4)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState((balance.borrowed / 4).toFixed(2))
        setRepayState(balance.borrowed / 4)
      }
    }
    if(action == 2) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState((borrowTemp / 2).toFixed(2))
        setBorrowState(borrowTemp / 2)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState((balance.borrowed / 2).toFixed(2))
        setRepayState(balance.borrowed / 2)
      }
    }
    if(action == 3) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState((borrowTemp * 0.75).toFixed(2))
        setBorrowState(borrowTemp * 0.75)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState((balance.borrowed * 0.75).toFixed(2))
        setRepayState(balance.borrowed * 0.75)
      }
    }
    if(action == 4) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState(borrowTemp.toFixed(2))
        setBorrowState(borrowTemp - 0.0000009)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState(balance.borrowed.toFixed(2))
        setRepayState(balance.borrowed)
      }
    }
  }

  const renderLabel = (): string => {
    if(activeToggleState === 'borrow') {
      return 'borrow'
    }
    if(activeToggleState === 'repay') {
      return 'repay'
    }

    return ''
  }

  const handleChange = (input: string) => {
    setDisplayStringState(input)
    if(activeToggleState === 'borrow') {
        if(!input) {
        setBorrowState(0)
      }
      else {
        setBorrowState(parseFloat(input))
      }
    }
    if(activeToggleState === 'repay') {
      if(!input) {
        setRepayState(0)
      }
      else {
        setRepayState(parseFloat(input))
      }
    }
  }

  const handleBalance = (): string => {
    if(activeToggleState === 'borrow') {
      const borrowTemp = (balance.staked - balance.locked) * (borrowInfoState.fsl / borrowInfoState.supply)
      return borrowTemp > 0 ? borrowTemp.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(activeToggleState === 'repay') {
      return balance.borrowed > 0 ? balance.borrowed.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }

    return ''
  }

  const refreshBorrowInfo = async () => {
    const fsl = await gammContract.read.fsl([])
    const supply = await gammContract.read.supply([])
    let honeyBorrowAllowance

    if(wallet) {
      honeyBorrowAllowance = await honeyContract.read.allowance([wallet, contracts.borrow.address])
    }

    const response = {
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
      honeyBorrowAllowance: wallet ? parseFloat(formatEther(honeyBorrowAllowance as unknown as bigint)) : 0,
    }

    setBorrowInfoState(response)
  }


  return (
    <BorrowContext.Provider
      value={{
        borrowInfo: borrowInfoState,
        activeToggle: activeToggleState,
        displayString: displayStringState,
        setDisplayString: setDisplayStringState,
        borrow: borrowState,
        repay: repayState,
        setBorrow: setBorrowState,
        setRepay: setRepayState,
        refreshBorrowInfo,
        changeActiveToggle,
        borrowPopupToggle: borrowPopupToggleState,
        setBorrowPopupToggle: setBorrowPopupToggleState,
        handlePercentageButtons,
        renderLabel,
        handleChange,
        handleBalance
      }}
    >
      { children }
    </BorrowContext.Provider>
  )
}

export const useBorrowing = () => useContext(BorrowContext)