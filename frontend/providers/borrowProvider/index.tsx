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

  refreshBorrowInfo: async () => {},
}

const BorrowContext = createContext(INITIAL_STATE)

export const BorrowProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { balance, wallet } = useWallet()

  //todo: type
  const [borrowInfoState, setBorrowInfoState] = useState(INITIAL_STATE.borrowInfo)

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
      staked: parseFloat(formatEther(staked as unknown as bigint)),
      borrowed: parseFloat(formatEther(borrowed as unknown as bigint)),
      locked: parseFloat(formatEther(locked as unknown as bigint)),
      fsl: parseFloat(formatEther(fsl as unknown as bigint)),
      supply: parseFloat(formatEther(supply as unknown as bigint)),
      honeyBorrowAllowance:parseFloat(formatEther(honeyBorrowAllowance as unknown as bigint)),
    }

    setBorrowInfoState(response)
  }

  return (
    <BorrowContext.Provider
      value={{
        borrowInfo: borrowInfoState,
        refreshBorrowInfo
      }}
    >
      { children }
    </BorrowContext.Provider>
  )
}

export const useBorrowing = () => useContext(BorrowContext)