"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useAccount, useNetwork, useWalletClient, useContractReads } from "wagmi"
import { getContract } from "@wagmi/core"
import { WalletClient, parseEther } from "viem"
import { contracts } from "../../utils/addressi"
import { WalletInitialState, BalanceState } from "../../utils/interfaces"

//todo: type
const INITIAL_STATE: WalletInitialState = {
  balance: {
    locks: parseEther('0'),
    prg: parseEther('0'),
    honey: parseEther('0')
  },
  wallet: '',
  isConnected: false,
  signer: null as WalletClient | null,
  network: '',
  refreshBalances: async () => {},
}

const WalletContext = createContext(INITIAL_STATE)

export const WalletProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { data: signer } = useWalletClient()
  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()

  //todo: type
  const [balanceState, setBalanceState] = useState<BalanceState>(INITIAL_STATE.balance)

  const locksContract = getContract({
    address: contracts.locks.address as `0x${string}`,
    abi: contracts.locks.abi
  })

  const porridgeContract = getContract({
    address: contracts.porridge.address as `0x${string}`,
    abi: contracts.porridge.abi
  })

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })

  // const { data: balances } = useContractReads({
  //   contracts: [
  //     {
  //       address: contracts.locks.address as `0x${string}`,
  //       abi: contracts.locks.abi,
  //       functionName: 'balanceOf',
  //       args: [address as `0x${string}`]
  //     },
  //     {
  //       address: contracts.porridge.address as `0x${string}`,
  //       abi: contracts.porridge.abi,
  //       functionName: 'balanceOf',
  //       args: [address as `0x${string}`]
  //     },
  //     {
  //       address: contracts.honey.address as `0x${string}`,
  //       abi: contracts.honey.abi,
  //       functionName: 'balanceOf',
  //       args: [address as `0x${string}`]
  //     }
  //   ],
  // })
  
  // const getBalances = async () => {



    // if(!walletAddress) {
    //   return
    // }
    // if (balances) {
    //   const [locks, prg, honey] = balances as unknown as [number, number, number]
    //   let response = {
    //     locks: locks / Math.pow(10, 18),
    //     prg: prg / Math.pow(10, 18),
    //     honey: honey / Math.pow(10, 18)
    //   }
    //   setBalanceState(response)
    // }
  // }

  const refreshBalances = async () => {
    if(address) {
      const locksBalance = await locksContract.read.balanceOf([address])
      const porridgeBalance = await porridgeContract.read.balanceOf([address])
      const honeyBalance = await honeyContract.read.balanceOf([address])

      let response = {
        locks: locksBalance as unknown as bigint,
        prg: porridgeBalance as unknown as bigint,
        honey: honeyBalance as unknown as bigint
      }

      setBalanceState(response)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        balance: balanceState,
        wallet: address ? address : '',
        isConnected,
        signer: signer || null,
        network: chain?.name ? chain.name : '',
        refreshBalances
      }}
    >
      { children }
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)