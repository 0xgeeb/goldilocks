"use client"

import { createContext, PropsWithChildren, useContext, useState } from "react"
import { useAccount, useNetwork, useWalletClient, useContractReads } from "wagmi"
import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { WalletClient, parseEther, formatEther } from "viem"
import { contracts } from "../../utils/addressi"
import { WalletInitialState, BalanceState } from "../../utils/interfaces"

const INITIAL_STATE: WalletInitialState = {
  balance: {
    locks: 0,
    prg: 0,
    honey: 0
  },
  wallet: '',
  isConnected: false,
  signer: null as WalletClient | null,
  network: '',
  refreshBalances: async () => {},
  sendMintTx: async () => ''
}

const WalletContext = createContext(INITIAL_STATE)

export const WalletProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { data: signer } = useWalletClient()
  const { chain } = useNetwork()
  const { address, isConnected } = useAccount()

  const [balanceState, setBalanceState] = useState<BalanceState>(INITIAL_STATE.balance)

  const gammContract = getContract({
    address: contracts.gamm.address as `0x${string}`,
    abi: contracts.gamm.abi
  })

  const porridgeContract = getContract({
    address: contracts.porridge.address as `0x${string}`,
    abi: contracts.porridge.abi
  })

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })

  const refreshBalances = async () => {
    if(address) {
      const locksBalance = await gammContract.read.balanceOf([address])
      const porridgeBalance = await porridgeContract.read.balanceOf([address])
      const honeyBalance = await honeyContract.read.balanceOf([address])

      const response = {
        locks: parseFloat(formatEther(locksBalance as unknown as bigint)),
        prg: parseFloat(formatEther(porridgeBalance as unknown as bigint)),
        honey: parseFloat(formatEther(honeyBalance as unknown as bigint))
      }

      setBalanceState(response)
    }
  }

  const sendMintTx = async (): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.honey.address as`0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'mint',
        args: [address, parseEther(`${1000000}`)]
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
    <WalletContext.Provider
      value={{
        balance: balanceState,
        wallet: address ? address : '',
        isConnected,
        signer: signer || null,
        network: chain?.name ? chain.name : '',
        refreshBalances,
        sendMintTx
      }}
    >
      { children }
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)