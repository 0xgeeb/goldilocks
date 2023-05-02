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
  ensureAllowance: async (token: string, spender: string, cost: number, signer: any): Promise<void | boolean> => {},
  sendBuyTx: async (buy: number, cost: number, signer: any): Promise<void | boolean> => {}
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

  const ensureAllowance = async (token: string, spender: string, cost: number, signer: any): Promise<boolean> => {

    const tokenContract = new ethers.Contract(
      '0x34eC325ddC7dAeF8FdF07FdAF807C31f660cDD18',
      // contracts[token].address,
      contracts[token].abi,
      signer
    )
    const allowanceTx = await tokenContract.balanceOf('0xAfD3A6AD0967f0dD590ABC5d4518A2920e642EEe')
    // const allowanceTx = await tokenContract.allowance(walletAddress, spender)
    const allowanceNum = allowanceTx._hex / Math.pow(10, 18)
    console.log(allowanceNum)

    if(cost > allowanceNum) {
      try {
        tokenContract.approve(spender, BigNumber.from(ethers.utils.parseUnits(cost.toString(), 18)))
        return false
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
        return false
      }
    }
    else {
      return true
    }
  }

  const sendBuyTx = async (buy: number, cost: number, signer: any): Promise<boolean> => {

    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      await ammContract.buy(BigNumber.from(ethers.utils.parseUnits(buy.toString(), 18)), BigNumber.from(ethers.utils.parseUnits(cost.toString(), 18)))
      return true
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
      return false
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