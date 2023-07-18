"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { parseEther, formatEther } from "viem"
import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { useWallet } from ".."
import { contracts } from "../../utils/addressi"

//todo: type
const INITIAL_STATE = {
  borrowInfo: {
    staked: 0,
    borrowed: 0,
    locked: 0,
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

  handlePercentageButtons: (_action: number) => {},
  renderLabel: () => '',
  handleInput: () => '',
  handleChange: (_input: string) => {},
  handleBalance: () => '',

  refreshBorrowInfo: async () => {},

  checkAllowance: async (_amt: number): Promise<void | boolean> => {},
  sendApproveTx: async (_amt: number) => {},
  sendBorrowTx: async (_borrowAmt: number): Promise<any> => {},
  sendRepayTx: async (_repayAmt: number): Promise<any> => {}
}

const BorrowContext = createContext(INITIAL_STATE)

export const BorrowProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet } = useWallet()

  //todo: type
  const [borrowInfoState, setBorrowInfoState] = useState(INITIAL_STATE.borrowInfo)
  const [activeToggleState, setActiveToggleState] = useState<string>(INITIAL_STATE.activeToggle)

  const [displayStringState, setDisplayStringState] = useState(INITIAL_STATE.displayString)

  const [borrowState, setBorrowState] = useState<number>(INITIAL_STATE.borrow)
  const [repayState, setRepayState] = useState<number>(INITIAL_STATE.repay)


  const porridgeContract = getContract({
    address: contracts.porridge.address as `0x${string}`,
    abi: contracts.porridge.abi
  })

  const gammContract = getContract({
    address: contracts.amm.address as `0x${string}`,
    abi: contracts.amm.abi
  })

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
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
    const borrowTemp = (borrowInfoState.staked - borrowInfoState.locked) * (borrowInfoState.fsl / borrowInfoState.supply)
    if(action == 1) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState((borrowTemp / 4).toFixed(2))
        setBorrowState(borrowTemp / 4)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState((borrowInfoState.borrowed / 4).toFixed(2))
        setRepayState(borrowInfoState.borrowed / 4)
      }
    }
    if(action == 2) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState((borrowTemp / 2).toFixed(2))
        setBorrowState(borrowTemp / 2)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState((borrowInfoState.borrowed / 2).toFixed(2))
        setRepayState(borrowInfoState.borrowed / 2)
      }
    }
    if(action == 3) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState((borrowTemp * 0.75).toFixed(2))
        setBorrowState(borrowTemp * 0.75)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState((borrowInfoState.borrowed * 0.75).toFixed(2))
        setRepayState(borrowInfoState.borrowed * 0.75)
      }
    }
    if(action == 4) {
      if(activeToggleState === 'borrow') {
        setDisplayStringState(borrowTemp.toFixed(2))
        setBorrowState(borrowTemp)
      }
      if(activeToggleState === 'repay') {
        setDisplayStringState(borrowInfoState.borrowed.toFixed(2))
        setRepayState(borrowInfoState.borrowed)
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

  const handleInput = (): string => {
    if(activeToggleState === 'borrow') {
      return borrowState > (borrowInfoState.fsl / borrowInfoState.supply) * (borrowInfoState.staked - borrowInfoState.locked)  ? '' : displayStringState
    }
    if(activeToggleState === 'repay') {
      return repayState > borrowInfoState.borrowed ? '' : displayStringState
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
      const borrowTemp = (borrowInfoState.staked - borrowInfoState.locked) * (borrowInfoState.fsl / borrowInfoState.supply)
      return borrowTemp > 0 ? borrowTemp.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }
    if(activeToggleState === 'repay') {
      return borrowInfoState.borrowed > 0 ? borrowInfoState.borrowed.toLocaleString('en-US', { maximumFractionDigits: 4 }) : "0.00"
    }

    return ''
  }

  const refreshBorrowInfo = async () => {
    let staked
    let borrowed
    let locked
    const fsl = await gammContract.read.fsl([])
    const supply = await gammContract.read.supply([])
    let honeyBorrowAllowance

    if(wallet) {
      staked = await porridgeContract.read.getStaked([wallet])
      borrowed = await borrowContract.read.getBorrowed([wallet])
      locked = await borrowContract.read.getLocked([wallet])
      honeyBorrowAllowance = await honeyContract.read.allowance([wallet, contracts.borrow.address])
    }

    const response = {
      staked: wallet ? parseFloat(formatEther(staked as unknown as bigint)) : 0,
      borrowed: wallet ? parseFloat(formatEther(borrowed as unknown as bigint)) : 0,
      locked: wallet ? parseFloat(formatEther(locked as unknown as bigint)) : 0,
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
      honeyBorrowAllowance: wallet ? parseFloat(formatEther(honeyBorrowAllowance as unknown as bigint)) : 0,
    }

    setBorrowInfoState(response)
  }

  const checkAllowance = async (amt: number): Promise<boolean> => {
    const allowance = await honeyContract.read.allowance([wallet, contracts.borrow.address])
    const allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))

    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amt)
    
    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const sendApproveTx = async (amt: number) => {
    try {
      await writeContract({
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'approve',
        args: [contracts.borrow.address, parseEther(`${amt}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendBorrowTx = async (borrowAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.borrow.address as `0x${string}`,
        abi: contracts.borrow.abi,
        functionName: 'borrow',
        args: [parseEther(`${borrowAmt}`)]
      })
      const data = await waitForTransaction({ hash })
      return data.transactionHash
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }

    return ''
  }

  const sendRepayTx = async (repayAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.borrow.address as `0x${string}`,
        abi: contracts.borrow.abi,
        functionName: 'stake',
        args: [parseEther(`${repayAmt}`)]
      })
      const data = await waitForTransaction({ hash })
      return data.transactionHash
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }

    return ''
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
        handlePercentageButtons,
        renderLabel,
        handleInput,
        handleChange,
        handleBalance,
        checkAllowance,
        sendApproveTx,
        sendBorrowTx,
        sendRepayTx
      }}
    >
      { children }
    </BorrowContext.Provider>
  )
}

export const useBorrowing = () => useContext(BorrowContext)