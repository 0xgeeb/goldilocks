import { createContext, PropsWithChildren, useContext, useState } from "react";
import { BigNumber, Signer, ethers } from "ethers"
import { useAccount, useSigner, useNetwork, useConnect } from "wagmi"
import { contracts } from "../pages/utils"

const INITIAL_STATE = {
  balance: {
    locks: 0,
    prg: 0,
    honey: 0
  },
  // wallet: undefined,
  isConnected: false,
  signer: null,
  network: null,
  // getBalance: async (string, any) => {},
  // updateBalance: async () => {},
  // ensureAllowance: async () => {}
}

const WalletContext = createContext(INITIAL_STATE)

export const WalletProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { data: signer, isLoading: signerLoading } = useSigner()
  const { chain } = useNetwork()
  const { address, isConnecting: accountLoading } = useAccount()
  const { isLoading: connectLoading } = useConnect()

  const [balanceState, setBalanceState] = useState(INITIAL_STATE.balance)

  const walletAddress = address;
  const isConnected = !!walletAddress && !!signer;

  const getBalance = async (address: string, signer: any) => {
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
    console.log(locksTx)

  }











  console.log('walletprovider')
  return (
    <WalletContext.Provider
      value={{
        balance: balanceState,
        // wallet: walletAddress || null,
        isConnected: isConnected,
        signer: null,
        network: null,
        // getBalance: getBalance,
        // updateBalance,
        // ensureAllowance
      }}
    >
      { children }
    </WalletContext.Provider>
  )
}