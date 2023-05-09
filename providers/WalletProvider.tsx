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
  checkAllowance: async (token: string, spender: string, cost: number, signer: any): Promise<void | boolean> => {},
  approve: async (token: string, spender: string, cost: number, signer: any) => {},
  sendBuyTx: async (buy: number, cost: number, signer: any): Promise<any> => {}
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
    console.log('locksBalance: ', locksTx._hex / Math.pow(10, 18))
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

  const checkAllowance = async (token: string, spender: string, cost: number, signer: any): Promise<boolean> => {

    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )

    const allowanceTx = await tokenContract.allowance(walletAddress, spender)
    const allowanceNum = allowanceTx._hex / Math.pow(10, 18)
    console.log('allowanceNum: ', allowanceNum)
    console.log('cost: ', cost)
    
    if(cost > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const approve = async (token: string, spender: string, cost: number, signer: any) => {

    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )

    try {
      const approveTx = await tokenContract.approve(spender, BigNumber.from(ethers.utils.parseUnits((cost + 0.01).toString(), 18))) 
      await approveTx.wait()
      console.log('done waiting')
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const ensureAllowance = async (token: string, spender: string, cost: number, signer: any): Promise<boolean> => {

    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )
    const allowanceTx = await tokenContract.allowance(walletAddress, spender)
    const allowanceNum = allowanceTx._hex / Math.pow(10, 18)
    console.log('allowanceNum: ', allowanceNum)
    console.log('cost: ', cost)

    if(cost > allowanceNum) {
      try {
        console.log('trying')
        await tokenContract.approve(spender, BigNumber.from(ethers.utils.parseUnits(cost.toString(), 18)))
        // return false
      }
      catch (e: any) {
        console.log('catching')
        console.log(e.code)
        if(e.code === 'ACTION_REJECTED') {
          console.log('user denied tx')
          // return false
        }
        else {
          console.log('whoops ', e)
          // return false
        }
      }
      return false
    }
    else {
      return true
    }
  }

  const sendBuyTx = async (buy: number, cost: number, signer: any): Promise<any> => {

    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      const buyReceipt = await ammContract.buy(BigNumber.from(ethers.utils.parseUnits(buy.toString(), 18)), BigNumber.from(ethers.utils.parseUnits(cost.toString(), 18)))
      await buyReceipt.wait()
      return buyReceipt
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
        checkAllowance,
        approve,
        sendBuyTx
      }}
    >
      { children }
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)