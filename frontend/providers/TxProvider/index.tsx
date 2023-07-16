"use client"

import { PropsWithChildren, createContext, useContext } from "react"
import { useAccount } from "wagmi"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE = {
  checkAllowance: async (token: string, spender: string, amount: number, signer: any): Promise<void | boolean> => {},
  sendApproveTx: async (token: string, spender: string, amount: number, signer: any) => {},
  sendStakeTx: async (stake: number, signer: any): Promise<any> => {},
  sendUnstakeTx: async (unstake: number, signer: any): Promise<any> => {},
  sendRealizeTx: async (realize: number, signer: any): Promise<any> => {},
  sendClaimTx: async (signer: any): Promise<any> => {},
  sendBorrowTx: async (borrow: number, signer: any): Promise<any> => {},
  sendRepayTx: async (repay: number, signer: any): Promise<any> => {},
  sendMintTx: async (singer: any): Promise<any> => {}
}

const TxContext = createContext(INITIAL_STATE)

export const TxProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { address } = useAccount()
  const walletAddress = address

  const checkAllowance = async (token: string, spender: string, amount: number, signer: Signer): Promise<boolean> => {
    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )
    const allowanceTx = await tokenContract.allowance(walletAddress, spender)
    const allowanceNum = allowanceTx._hex / Math.pow(10, 18)
    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amount)
    if(amount > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const sendApproveTx = async (token: string, spender: string, amount: number, signer: any) => {
    const tokenContract = new ethers.Contract(
      contracts[token].address,
      contracts[token].abi,
      signer
    )

    try {
      const approveTx = await tokenContract.approve(spender, BigNumber.from(ethers.utils.parseUnits((amount + 0.01).toString(), 18))) 
      await approveTx.wait()
      console.log('done waiting')
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendStakeTx = async (stake: number, signer: any): Promise<any> => {
    const prgContract = new ethers.Contract(
      contracts.porridge.address,
      contracts.porridge.abi,
      signer
    )
    try {
      const stakeReceipt = await prgContract.stake(BigNumber.from(ethers.utils.parseUnits(stake.toString(), 18)))
      await stakeReceipt.wait()
      return stakeReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendUnstakeTx = async (unstake: number, signer: any): Promise<any> => {
    const prgContract = new ethers.Contract(
      contracts.porridge.address,
      contracts.porridge.abi,
      signer
    )
    try {
      const unstakeReceipt = await prgContract.unstake(BigNumber.from(ethers.utils.parseUnits(unstake.toString(), 18)))
      await unstakeReceipt.wait()
      return unstakeReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendRealizeTx = async (realize: number, signer: any): Promise<any> => {
    const prgContract = new ethers.Contract(
      contracts.porridge.address,
      contracts.porridge.abi,
      signer
    )
    try {
      const realizeReceipt = await prgContract.realize(BigNumber.from(ethers.utils.parseUnits(realize.toString(), 18)))
      await realizeReceipt.wait()
      return realizeReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendClaimTx = async (signer: any): Promise<any> => {
    const prgContract = new ethers.Contract(
      contracts.porridge.address,
      contracts.porridge.abi,
      signer
    )
    try {
      const claimReceipt = await prgContract.claim()
      await claimReceipt.wait()
      return claimReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendBorrowTx = async (borrow: number, signer: any): Promise<any> => {
    const borrowContract = new ethers.Contract(
      contracts.borrow.address,
      contracts.borrow.abi,
      signer
    )
    try {
      const borrowReceipt = await borrowContract.borrow(BigNumber.from(ethers.utils.parseUnits(borrow.toString(), 18)))
      await borrowReceipt.wait()
      return borrowReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendRepayTx = async (repay: number, signer: any): Promise<any> => {
    const borrowContract = new ethers.Contract(
      contracts.borrow.address,
      contracts.borrow.abi,
      signer
    )
    try {
      const repayReceipt = await borrowContract.repay(BigNumber.from(ethers.utils.parseUnits(repay.toString(), 18)))
      await repayReceipt.wait()
      return repayReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  return (
    <TxContext.Provider
      value={{
        checkAllowance,
        sendApproveTx,
        sendStakeTx,
        sendUnstakeTx,
        sendRealizeTx,
        sendClaimTx,
        sendBorrowTx,
        sendRepayTx,
      }}
    >
      { children }
    </TxContext.Provider>
  )
}

export const useTx = () => useContext(TxContext)