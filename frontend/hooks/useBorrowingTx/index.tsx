import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { parseEther, formatEther } from "viem"
import { contracts } from "../../utils/addressi"

export const useBorrowingTx = () => {

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })

  const checkAllowance = async (amt: number, wallet: string): Promise<boolean> => {
    const allowance = await honeyContract.read.allowance([wallet, contracts.borrow.address])
    const allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))

    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amt)
    
    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const sendApproveTx = async (amt: number) => {
    try {
      await writeContract({
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'approve',
        args: [contracts.borrow.address, parseEther(`${amt}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendBorrowTx = async (borrowAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.borrow.address as `0x${string}`,
        abi: contracts.borrow.abi,
        functionName: 'borrow',
        args: [parseEther(`${borrowAmt}`)]
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

  const sendRepayTx = async (repayAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.borrow.address as `0x${string}`,
        abi: contracts.borrow.abi,
        functionName: 'repay',
        args: [parseEther(`${repayAmt}`)]
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

  return { checkAllowance, sendApproveTx, sendBorrowTx, sendRepayTx }
}