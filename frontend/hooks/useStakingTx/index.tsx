import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { parseEther, formatEther } from "viem"
import { contracts } from "../../utils/addressi"

export const useStakingTx = () => {

  const honeyContract = getContract({
    address: contracts.honey.address as `0x${string}`,
    abi: contracts.honey.abi
  })

  const gammContract = getContract({
    address: contracts.gamm.address as `0x${string}`,
    abi: contracts.gamm.abi
  })

  const checkAllowance = async (amt: number, token: string, wallet: string): Promise<boolean> => {
    let allowance
    let allowanceNum

    if(token === 'locks') {
      allowance = await gammContract.read.allowance([wallet, contracts.porridge.address])
      allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))
    }
    else {
      allowance = await honeyContract.read.allowance([wallet, contracts.porridge.address])
      allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))
    }

    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amt)
    
    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const sendApproveTx = async (amt: number, token: string) => {
    if(token === 'locks') {
      try {
        await writeContract({
          address: contracts.gamm.address as `0x${string}`,
          abi: contracts.gamm.abi,
          functionName: 'approve',
          args: [contracts.porridge.address, parseEther(`${amt}`)]
        })
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }
    }
    else {
      try {
        await writeContract({
          address: contracts.honey.address as `0x${string}`,
          abi: contracts.honey.abi,
          functionName: 'approve',
          args: [contracts.porridge.address, parseEther(`${amt}`)]
        })
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }

    }
  }

  const sendStakeTx = async (stakeAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'stake',
        args: [parseEther(`${stakeAmt}`)]
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

  const sendUnstakeTx = async (unstakeAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'unstake',
        args: [parseEther(`${unstakeAmt}`)]
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

  const sendRealizeTx = async (realizeAmt: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'realize',
        args: [parseEther(`${realizeAmt}`)]
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

  const sendClaimTx = async (): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'claim',
        args: []
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

  return { checkAllowance, sendApproveTx, sendStakeTx, sendUnstakeTx, sendRealizeTx, sendClaimTx }
}