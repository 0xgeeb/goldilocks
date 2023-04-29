import { createContext, PropsWithChildren, useContext, useState } from "react";
import { BigNumber, Signer, ethers } from "ethers"
import { useAccount, useSigner, useNetwork, useConnect } from "wagmi"
import { contracts } from "../utils"

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
  getBalance: async () => {},
  updateBalance: async () => {},
  ensureAllowance: async (token: string, spender: string, cost: number) => {},
  sendBuyTx: async (buy: number, cost: number) => {}
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
    console.log('running getBalance')
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

  const updateBalance = async () => {
    if(!walletAddress || !signer) {
      return;
    }

    getBalance(walletAddress, signer)
  }

  const ensureAllowance = async (token: string, spender: string, cost: number) => {
    if(!walletAddress || !signer) {
      return;
    }

    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )
    const allowanceTx = await tokenContract.allowance(walletAddress, spender)
    const allowanceNum = allowanceTx._hex / Math.pow(10, 18)

    if(cost > allowanceNum) {
      try {
        await tokenContract.approve(spender, BigNumber.from(ethers.utils.parseUnits(cost.toString(), 18)))
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }
    }
  }

  const sendBuyTx = async (buy: number, cost: number) => {
    if(!walletAddress || !signer) {
      return;
    }

    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      await ammContract.buy(BigNumber.from(ethers.utils.parseUnits(buy.toString(), 18)), BigNumber.from(ethers.utils.parseUnits(cost.toString(), 18)))
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  return (
    <WalletContext.Provider
      value={{
        balance: balanceState,
        wallet: walletAddress ? walletAddress : '',
        isConnected: isConnected,
        signer: signer || null,
        network: chain?.name ? chain.name : '',
        getBalance: updateBalance,
        updateBalance,
        ensureAllowance,
        sendBuyTx
      }}
    >
      { children }
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)