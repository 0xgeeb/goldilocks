"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react";
import { useAccount, useSigner, useNetwork, useContractReads } from "wagmi"
import { Signer, ethers } from "ethers"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE = {
  balance: {
    locks: 0,
    prg: 0,
    honey: 0
  },
  wallet: '',
  isConnected: false,
  signer: null as Signer | null,
  network: '',
  getBalances: async () => {},
  refreshBalances: async (address: string, signer: any) => {},
}

const WalletContext = createContext(INITIAL_STATE)

export const WalletProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const { address } = useAccount()

  const [balanceState, setBalanceState] = useState(INITIAL_STATE.balance)

  const walletAddress = address
  const isConnected = !!walletAddress && !!signer

  const { data: balances } = useContractReads({
    contracts: [
      {
        address: contracts.locks.address as `0x${string}`,
        abi: contracts.locks.abi,
        functionName: 'balanceOf',
        args: [walletAddress]
      },
      {
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'balanceOf',
        args: [walletAddress]
      },
      {
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'balanceOf',
        args: [walletAddress]
      }
    ],
  })
  
  const getBalances = async () => {
    if(!walletAddress) {
      return
    }
    if (balances) {
      const [locks, prg, honey] = balances as unknown as [number, number, number]
      let response = {
        locks: locks / Math.pow(10, 18),
        prg: prg / Math.pow(10, 18),
        honey: honey / Math.pow(10, 18)
      }
      setBalanceState(response)
    }
  }

  const refreshBalances = async (address: string, signer: Signer) => {
    let response = {
      locks: 0,
      prg: 0,
      honey: 0
    }

    const locksContract = new ethers.Contract(
      contracts.locks.address,
      contracts.locks.abi,
      signer
    )
    const locksTx = await locksContract.balanceOf(address)
    response = { ...response, locks: locksTx._hex / Math.pow(10, 18)}

    const porridgeContract = new ethers.Contract(
      contracts.porridge.address,
      contracts.porridge.abi,
      signer
    )
    const porridgeTx = await porridgeContract.balanceOf(address)
    response = { ...response, prg: porridgeTx._hex / Math.pow(10, 18)}

    const honeyContract = new ethers.Contract(
      contracts.honey.address,
      contracts.honey.abi,
      signer
    )
    const honeyTx = await honeyContract.balanceOf(address)
    response = { ...response, honey: honeyTx._hex / Math.pow(10, 18)}
    
    setBalanceState(response)
  }

  return (
    <WalletContext.Provider
      value={{
        balance: balanceState,
        wallet: walletAddress ? walletAddress : '',
        isConnected,
        signer: signer || null,
        network: chain?.name ? chain.name : '',
        getBalances,
        refreshBalances
      }}
    >
      { children }
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)