import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { parseEther, formatEther } from "viem"
import { contracts } from "../../utils/addressi"

export const usePresaleTx = () => {

  const checkAllowance = async (amt: number, wallet: string): Promise<boolean> => {
    let allowance
    let allowanceNum

    const govlocksContract = getContract({
      address: contracts.govlocks.address as `0x${string}`,
      abi: contracts.govlocks.abi
    })

    allowance = await govlocksContract.read.allowance([wallet, contracts.lge.address])
    allowanceNum = parseFloat(formatEther(allowance as unknown as bigint))

    console.log('allowanceNum: ', allowanceNum)
    console.log('amount: ', amt)
    
    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  return { checkAllowance }

}