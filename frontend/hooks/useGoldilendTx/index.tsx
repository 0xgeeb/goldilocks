import { getContract, writeContract, waitForTransaction } from "@wagmi/core"
import { parseEther, formatEther } from "viem"
import { contracts } from "../../utils/addressi"
import { BeraInfo, LoanData, PartnerInfo } from "../../utils/interfaces"
import { useWallet } from "../../providers"

export const useGoldilendTx = () => {

  const { wallet } = useWallet()

  const goldilendContract = getContract({
    address: contracts.goldilend.address as `0x${string}`,
    abi: contracts.goldilend.abi
  })

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

  const beraContract = getContract({
    address: contracts.bera.address as `0x${string}`,
    abi: contracts.bera.abi
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

  const checkRepayAllowance = async (amt: number): Promise<boolean> => {
    const beraAllowance = await beraContract.read.allowance([wallet, contracts.goldilend.address])
    const allowanceNum = parseFloat(formatEther(beraAllowance as unknown as bigint))
  
    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const checkLockAllowance = async (amt: number): Promise<boolean> => {
    const beraAllowance = await beraContract.read.allowance([wallet, contracts.goldilend.address])
    const allowanceNum = parseFloat(formatEther(beraAllowance as unknown as bigint))

    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
  }

  const checkStakeAllowance = async (amt: number): Promise<boolean> => {
    const gberaAllowance = await goldilendContract.read.allowance([wallet, contracts.goldilend.address])
    const allowanceNum = parseFloat(formatEther(gberaAllowance as unknown as bigint))

    if(amt > allowanceNum) {
      return false
    }
    else {
      return true
    }
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

  const sendBeraApproveTx = async (amt: number) => {
    try {
      await writeContract({
        address: contracts.bera.address as `0x${string}`,
        abi: contracts.bera.abi,
        functionName: 'approve',
        args: [contracts.goldilend.address, parseEther(`${amt}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendgBeraApproveTx = async (amt: number) => {
    try {
      await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'approve',
        args: [contracts.goldilend.address, parseEther(`${amt}`)]
      })
    }
    catch (e) {
      console.log('user denied tx')
      console.log('or: ', e)
    }
  }

  const sendBoostTx = async (selectedPartners: PartnerInfo[], expiry: number): Promise<string> => {
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

  const sendBorrowTx = async (loanAmount: number, selectedBeras: BeraInfo[], duration: number): Promise<string> => {
    if(selectedBeras.length == 1) {
      try {
        const { hash } = await writeContract({
          address: contracts.goldilend.address as `0x${string}`,
          abi: contracts.goldilend.abi,
          functionName: 'borrow',
          args: [parseEther(`${loanAmount}`), duration, selectedBeras[0].name === 'BondBera' ? contracts.bondbear.address : contracts.bandbear.address, selectedBeras[0].id]
        })
        const data = await waitForTransaction({ hash })
        return data.transactionHash
      }
      catch (e) {
        console.log('user denied tx')
        console.log('or: ', e)
      }
    }
    else{
      let nfts = []
      let ids = []
      for(let i = 0; i < selectedBeras.length; i++) {
        nfts.push(selectedBeras[i].name === 'BondBera' ? contracts.bondbear.address : contracts.bandbear.address)
        ids.push(selectedBeras[i].id)
      }
      try {
        const { hash } = await writeContract({
          address: contracts.goldilend.address as `0x${string}`,
          abi: contracts.goldilend.abi,
          functionName: 'borrow',
          args: [parseEther(`${loanAmount}`), duration, nfts, ids]
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

  const sendRepayTx = async (repayAmount: number, loanId: number, maxToggle: boolean): Promise<string> => {
    const loan = await goldilendContract.read.lookupLoan([wallet, loanId])
    const userLoan = loan as unknown as LoanData
    try {
      const { hash } = await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'repay',
        args: [maxToggle ? userLoan.borrowedAmount.toString() : parseEther(`${repayAmount}`), loanId]
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

  const sendLockTx = async (lockAmount: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'lock',
        args: [parseEther(`${lockAmount}`)]
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

  const sendStakeTx = async (stakeAmount: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'stake',
        args: [parseEther(`${stakeAmount}`)]
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

  const sendUnstakeTx = async (unstakeAmount: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'unstake',
        args: [parseEther(`${unstakeAmount}`)]
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
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
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

  const sendLiquidateTx = async (addy: string, id: number): Promise<string> => {
    try {
      const { hash } = await writeContract({
        address: contracts.goldilend.address as `0x${string}`,
        abi: contracts.goldilend.abi,
        functionName: 'liquidate',
        args: [addy, id]
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

  return { 
    checkBoostAllowance,
    checkLoanAllowance,
    sendGoldilendNFTApproveTx,
    sendBoostTx,
    sendExtendBoostTx,
    sendWithdrawBoostTx,
    sendBorrowTx,
    sendRepayTx,
    checkRepayAllowance,
    sendBeraApproveTx,
    sendLockTx,
    sendStakeTx,
    sendUnstakeTx,
    sendClaimTx,
    checkLockAllowance,
    checkStakeAllowance,
    sendgBeraApproveTx,
    sendLiquidateTx
  }
}