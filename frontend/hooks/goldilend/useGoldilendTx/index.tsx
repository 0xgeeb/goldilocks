import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { parseEther, formatEther } from "viem"
import { contracts } from "../../../utils/addressi"
import { PartnerInfo } from "../../../utils/interfaces"

export const useGoldilendTx = () => {

  const honeycombContract = getContract({
    address: contracts.honeycomb.address as `0x${string}`,
    abi: contracts.honeycomb.abi
  })

  const beradromeContract = getContract({
    address: contracts.beradrome.address as `0x${string}`,
    abi: contracts.beradrome.abi
  })
  
  const checkBoostAllowance = async (nfts: PartnerInfo[]): Promise<boolean[]> => {
    let combFlag = true
    let dromeFlag = true
    
    for(let i = 0; i < nfts.length; i++) {
      if(nfts[i].name === "HoneyComb") {
        const honeycombAllowance = await honeycombContract.read.getApproved([nfts[i].id])
        const honeycombAllowanceStr = honeycombAllowance as unknown as string
        if(honeycombAllowanceStr !== contracts.goldilend.address) {
          combFlag = false
        }
      }
      else {
        const beradromeAllowance = await beradromeContract.read.getApproved([nfts[i].id])
        const beradromeAllowanceStr = beradromeAllowance as unknown as string
        if(beradromeAllowanceStr !== contracts.goldilend.address) {
          dromeFlag = false
        }
      }
    }

    return [combFlag, dromeFlag]
  }
  
  const sendGoldilendNFTApproveTx = async (nft: string) => {
    try {
      await writeContract({
        address: nft as `0x${string}`,
        abi: contracts.bondbear.abi,
        functionName: 'setApprovalForAll',
        args: [contracts.goldilend.address, true]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  //todo: implement these functions
  const sendApproveTx = async () => {

  }

  const sendBorrowTx = async () => {

  }

  return { checkBoostAllowance, sendGoldilendNFTApproveTx }
}