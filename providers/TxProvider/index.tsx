import { PropsWithChildren, createContext, useContext } from "react"
import { BigNumber, Signer, ethers } from "ethers"
import { useAccount } from "wagmi"
import { contracts } from "../../utils"

const INITIAL_STATE = {
  checkAllowance: async (token: string, spender: string, amount: number, signer: any): Promise<void | boolean> => {},
  sendApproveTx: async (token: string, spender: string, amount: number, signer: any) => {},
  sendBuyTx: async (buy: number, amount: number, signer: any): Promise<any> => {},
  sendSellTx: async (sell: number, receive: number, signer: any): Promise<any> => {},
  sendRedeemTx: async (redeem: number, signer: any): Promise<any> => {},
  sendStakeTx: async (stake: number, signer: any): Promise<any> => {},
  sendUnstakeTx: async (unstake: number, signer: any): Promise<any> => {},
  sendRealizeTx: async (realize: number, signer: any): Promise<any> => {},
  sendClaimTx: async (signer: any): Promise<any> => {},
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

  const sendBuyTx = async (buy: number, amount: number, signer: any): Promise<any> => {
    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      const buyReceipt = await ammContract.buy(BigNumber.from(ethers.utils.parseUnits(buy.toString(), 18)), BigNumber.from(ethers.utils.parseUnits(amount.toString(), 18)))
      await buyReceipt.wait()
      return buyReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendSellTx = async (sell: number, receive: number, signer: any): Promise<any> => {
    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      const sellReceipt = await ammContract.sell(BigNumber.from(ethers.utils.parseUnits(sell.toString(), 18)), BigNumber.from(ethers.utils.parseUnits(receive.toString(), 18)))
      await sellReceipt.wait()
      return sellReceipt
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendRedeemTx = async (redeem: number, signer: any): Promise<any> => {
    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    try {
      const redeemReceipt = await ammContract.redeem(BigNumber.from(ethers.utils.parseUnits(redeem.toString(), 18)))
      await redeemReceipt.wait()
      return redeemReceipt
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

  return (
    <TxContext.Provider
      value={{
        checkAllowance,
        sendApproveTx,
        sendBuyTx,
        sendSellTx,
        sendRedeemTx,
        sendStakeTx,
        sendUnstakeTx,
        sendRealizeTx,
        sendClaimTx
      }}
    >
      { children }
    </TxContext.Provider>
  )
}

export const useTx = () => useContext(TxContext)