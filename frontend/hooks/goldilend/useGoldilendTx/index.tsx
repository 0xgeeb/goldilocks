import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { parseEther, formatEther } from "viem"
import { contracts } from "../../../utils/addressi"
import { PartnerInfo } from "../../../utils/interfaces"
import { useWallet } from "../../../providers"

export const useGoldilendTx = () => {

  const { wallet } = useWallet()

  const bondbearContract = getContract({
    address: contracts.bondbear.address as `0x${string}`,
    abi: contracts.bondbear.abi
  })

  const bandbearContract = getContract({
    address: contracts.bandbear.address as `0x${string}`,
    abi: contracts.bandbear.abi
  })

  const honeycombContract = getContract({
    address: contracts.honeycomb.address as `0x${string}`,
    abi: contracts.honeycomb.abi
  })

  const beradromeContract = getContract({
    address: contracts.beradrome.address as `0x${string}`,
    abi: contracts.beradrome.abi
  })
  
  const checkBoostAllowance = async (): Promise<boolean[]> => {
    const honeycombAllApproved = await honeycombContract.read.isApprovedForAll([wallet, contracts.goldilend.address])
    const beradromeAllApproved = await beradromeContract.read.isApprovedForAll([wallet, contracts.goldilend.address])
    
    const hcAA = honeycombAllApproved as unknown as boolean
    const bdAA = beradromeAllApproved as unknown as boolean

    return [hcAA, bdAA]
  }

  const checkLoanAllowance = async (): Promise<boolean[]> => {
    const bondbearAllApproved = await bondbearContract.read.isApprovedForAll([wallet, contracts.goldilend.address])
    const bandbearAllApproved = await bandbearContract.read.isApprovedForAll([wallet, contracts.goldilend.address])

    const boAA = bondbearAllApproved as unknown as boolean
    const baAA = bandbearAllApproved as unknown as boolean

    return [boAA, baAA]
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

  const sendBoostTx = async (selectedPartners: PartnerInfo[], expiry: number): Promise<string> => {
    console.log(selectedPartners)
    if(selectedPartners.length == 1) {
      try {
        const { hash } = await writeContract({
          address: contracts.goldilend.address as `0x${string}`,
          abi: contracts.goldilend.abi,
          functionName: 'boost',
          args: [selectedPartners[0].name === "HoneyComb" ? contracts.honeycomb.address : contracts.beradrome.address, selectedPartners[0].id, expiry]
        })
        const data = await waitForTransaction({ hash })
        return data.transactionHash
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }
    }
    else {
      let nfts = []
      let ids = []
      for(let i = 0; i < selectedPartners.length; i++) {
        nfts.push(selectedPartners[i].name === "HoneyComb" ? contracts.honeycomb.address : contracts.beradrome.address)
        ids.push(selectedPartners[i].id)
      }
      try {
        const { hash } = await writeContract({
          address: contracts.goldilend.address as `0x${string}`,
          abi: contracts.goldilend.abi,
          functionName: 'boost',
          args: [nfts, ids, expiry]
        })
        const data = await waitForTransaction({ hash })
        return data.transactionHash
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }
    }

    return ''
  }

  const sendExtendBoostTx = async (newExpiry: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'extendBoost',
        args: [newExpiry]
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

  const sendWithdrawBoostTx = async (): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'withdrawBoost',
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

  // const sendBorrowTx = async (): Promise<string> => {

  // }

  return { 
    checkBoostAllowance,
    checkLoanAllowance,
    sendGoldilendNFTApproveTx,
    sendBoostTx,
    sendExtendBoostTx,
    sendWithdrawBoostTx 
  }
}