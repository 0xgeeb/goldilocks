import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { parseEther, formatEther } from "viem"
import { contracts } from "../../utils/addressi"

export const useGammTx = () => {

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })

  const checkAllowance = async (amt: number, wallet: string): Promise<boolean> => {
    const allowance = await honeyContract.read.allowance([wallet, contracts.gamm.address])
    const allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))

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
        args: [contracts.gamm.address, parseEther(`${amt + 0.01}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendBuyTx = async (buyAmt: number, maxCost: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.gamm.address as `0x${string}`,
        abi: contracts.gamm.abi,
        functionName: 'buy',
        args: [parseEther(`${buyAmt}`), parseEther(`${maxCost}`)]
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

  const sendSellTx = async (sellAmt: number, minReceive: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.gamm.address as `0x${string}`,
        abi: contracts.gamm.abi,
        functionName: 'sell',
        args: [parseEther(`${sellAmt}`), parseEther(`${minReceive}`)]
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

  const sendRedeemTx = async (redeemAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.gamm.address as `0x${string}`,
        abi: contracts.gamm.abi,
        functionName: 'redeem',
        args: [parseEther(`${redeemAmt}`)]
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

  return { checkAllowance, sendApproveTx, sendBuyTx, sendSellTx, sendRedeemTx }
}