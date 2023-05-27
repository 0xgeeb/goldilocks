import { createContext, PropsWithChildren, useContext, useState } from "react";
import { useContractReads } from "wagmi"
import { Signer, ethers } from "ethers"
import { useWallet } from "../../providers"
import { contracts } from "../../utils/addressi"

const INITIAL_STATE = {
  ammInfo: {
    fsl: 0,
    psl: 0,
    supply: 0,
    targetRatio: 0,
    lastFloorRaise: 0,
    honeyAmmAllowance: 0
  },
  stakeInfo: {
    fsl: 0,
    supply: 0,
    staked: 0,
    yieldToClaim: 0,
    locksPrgAllowance: 0,
    honeyPrgAllowance: 0
  },
  borrowInfo: {
    staked: 0,
    borrowed: 0,
    locked: 0,
    fsl: 0,
    supply: 0,
    honeyBorrowAllowance: 0
  },
  getAmmInfo: async (): Promise<any> => {},
  refreshAmmInfo: async (signer: any): Promise<any> => {},
  getStakeInfo: async () => {},
  refreshStakeInfo: async (signer: any) => {},
  getBorrowInfo: async () => {},
  refreshBorrowInfo: async (signer: any) => {}
}

const InfoContext = createContext(INITIAL_STATE)

export const InfoProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  const [ammInfoState, setAmmInfoState] = useState(INITIAL_STATE.ammInfo)
  const [stakeInfoState, setStakeInfoState] = useState(INITIAL_STATE.stakeInfo)
  const [borrowInfoState, setBorrowInfoState] = useState(INITIAL_STATE.borrowInfo)

  const { data: info } = useContractReads({
    contracts: [
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'fsl'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'psl'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'supply'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'targetRatio'
      },
      {
        address: contracts.amm.address as `0x${string}`,
        abi: contracts.amm.abi,
        functionName: 'lastFloorRaise'
      },
      {
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'allowance',
        args: [wallet, contracts.amm.address]
      },
      {
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: 'getStaked',
        args: [wallet]
      },
      {
        address: contracts.porridge.address as `0x${string}`,
        abi: contracts.porridge.abi,
        functionName: '_calculateYield',
        args: [wallet]
      },
      {
        address: contracts.locks.address as `0x${string}`,
        abi: contracts.locks.abi,
        functionName: 'allowance',
        args: [wallet, contracts.porridge.address]
      },
      {
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'allowance',
        args: [wallet, contracts.porridge.address]
      },
      {
        address: contracts.borrow.address as `0x${string}`,
        abi: contracts.borrow.abi,
        functionName: 'getBorrowed',
        args: [wallet]
      },
      {
        address: contracts.borrow.address as `0x${string}`,
        abi: contracts.borrow.abi,
        functionName: 'getLocked',
        args: [wallet]
      },
      {
        address: contracts.honey.address as `0x${string}`,
        abi: contracts.honey.abi,
        functionName: 'allowance',
        args: [wallet, contracts.borrow.address]
      },
    ]
  })

  const getAmmInfo = async (): Promise<any> => {
    if(info) {
      const [fsl, psl, supply, targetRatio, lastFloorRaise, honeyAmmAllowance] = info as unknown as [number, number, number, number, number, number]
      let response = {
        fsl: fsl / Math.pow(10, 18),
        psl: psl / Math.pow(10, 18),
        supply: supply / Math.pow(10, 18),
        targetRatio: targetRatio / Math.pow(10, 18),
        lastFloorRaise: lastFloorRaise / Math.pow(10, 18),
        honeyAmmAllowance: honeyAmmAllowance / Math.pow(10, 18)
      }
      setAmmInfoState(response)
      return response
    }
  }

  const refreshAmmInfo = async (signer: Signer): Promise<any> => {
    let response = {
      fsl: 0,
      psl: 0,
      supply: 0,
      targetRatio: 0,
      lastFloorRaise: 0,
      honeyAmmAllowance: 0
    }

    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    const fslTx = await ammContract.fsl()
    response = { ...response, fsl: fslTx._hex / Math.pow(10, 18)}
    const pslTx = await ammContract.psl()
    response = { ...response, psl: pslTx._hex / Math.pow(10, 18)}
    const supplyTx = await ammContract.supply()
    response = { ...response, supply: supplyTx._hex / Math.pow(10, 18)}
    const ratioTx = await ammContract.targetRatio()
    response = { ...response, targetRatio: ratioTx._hex / Math.pow(10, 18)}
    const lastRaiseTx = await ammContract.lastFloorRaise()
    response = { ...response, lastFloorRaise: lastRaiseTx._hex / Math.pow(10, 18)}

    const honeyContract = new ethers.Contract(
      contracts.honey.address,
      contracts.honey.abi,
      signer
    )
    const allowanceTx = await honeyContract.allowance(wallet, contracts.amm.address)
    response = { ...response, honeyAmmAllowance: allowanceTx._hex / Math.pow(10, 18)}

    setAmmInfoState(response)
    return response
  }

  const getStakeInfo = async () => {
    if(info) {
      const [fsl, psl, supply, targetRatio, lastFloorRaise, honeyAmmAllowance, staked, yieldToClaim, locksPrgAllowance, honeyPrgAllowance] = info as unknown as [number, number, number, number, number, number, number, number, number, number]
      let response = {
        fsl: fsl / Math.pow(10, 18),
        supply: supply / Math.pow(10, 18),
        staked: staked / Math.pow(10, 18),
        yieldToClaim: yieldToClaim / Math.pow(10, 18),
        locksPrgAllowance: locksPrgAllowance / Math.pow(10, 18),
        honeyPrgAllowance: honeyPrgAllowance / Math.pow(10, 18)
      }
      setStakeInfoState(response)
    }
  }

  const refreshStakeInfo = async (signer: Signer) => {
    let response = {
      fsl: 0,
      supply: 0,
      staked: 0,
      yieldToClaim: 0,
      locksPrgAllowance: 0,
      honeyPrgAllowance: 0
    }

    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    const fslTx = await ammContract.fsl()
    response = { ...response, fsl: fslTx._hex / Math.pow(10, 18)}
    const supplyTx = await ammContract.supply()
    response = { ...response, supply: supplyTx._hex / Math.pow(10, 18)}

    const prgContract = new ethers.Contract(
      contracts.porridge.address,
      contracts.porridge.abi,
      signer
    )
    const stakedTx = await prgContract.getStaked(wallet)
    response = { ...response, staked: stakedTx._hex / Math.pow(10, 18)}
    const yieldToClaimTx = await prgContract._calculateYield(wallet)
    response = { ...response, yieldToClaim: yieldToClaimTx._hex / Math.pow(10, 18)}

    const locksContract = new ethers.Contract(
      contracts.locks.address,
      contracts.locks.abi,
      signer
    )
    const allowanceLocksTx = await locksContract.allowance(wallet, contracts.porridge.address)
    response = { ...response, locksPrgAllowance: allowanceLocksTx._hex / Math.pow(10, 18)}

    const honeyContract = new ethers.Contract(
      contracts.honey.address,
      contracts.honey.abi,
      signer
    )
    const allowanceHoneyTx = await honeyContract.allowance(wallet, contracts.porridge.address)
    response = { ...response, honeyPrgAllowance: allowanceHoneyTx._hex / Math.pow(10, 18)}

    setStakeInfoState(response)
  }

  const getBorrowInfo = async () => {
    if(info) {
      const [fsl, psl, supply, targetRatio, lastFloorRaise, honeyAmmAllowance, staked, yieldToClaim, locksPrgAllowance, honeyPrgAllowance, borrowed, locked, honeyBorrowAllowance] = info as unknown as [number, number, number, number, number, number, number, number, number, number, number, number, number]
      let response = {
        staked: staked / Math.pow(10, 18),
        borrowed: borrowed / Math.pow(10, 18),
        locked: locked / Math.pow(10, 18),
        fsl: fsl / Math.pow(10, 18),
        supply: supply / Math.pow(10, 18),
        honeyBorrowAllowance: honeyBorrowAllowance / Math.pow(10, 18)
      }
      setBorrowInfoState(response)
    }
  }

  const refreshBorrowInfo = async (signer: Signer) => {
    console.log('refreshing borrow info')
    let response = {
      staked: 0,
      borrowed: 0,
      locked: 0,
      fsl: 0,
      supply: 0,
      honeyBorrowAllowance: 0
    }

    const borrowContract = new ethers.Contract(
      contracts.borrow.address,
      contracts.borrow.abi,
      signer
    )
    const lockedTx = await borrowContract.getLocked(wallet)
    response = { ...response, locked: lockedTx / Math.pow(10, 18)}
    const borrowedTx = await borrowContract.getBorrowed(wallet)
    response = { ...response, borrowed: borrowedTx / Math.pow(10, 18)}

    const prgContract = new ethers.Contract(
      contracts.porridge.address,
      contracts.porridge.abi,
      signer
    )
    const stakedTx = await prgContract.getStaked(wallet)
    response = { ...response, staked: stakedTx._hex / Math.pow(10, 18)}

    const ammContract = new ethers.Contract(
      contracts.amm.address,
      contracts.amm.abi,
      signer
    )
    const fslTx = await ammContract.fsl()
    response = { ...response, fsl: fslTx._hex / Math.pow(10, 18)}
    const supplyTx = await ammContract.supply()
    response = { ...response, supply: supplyTx._hex / Math.pow(10, 18)}

    const honeyContract = new ethers.Contract(
      contracts.honey.address,
      contracts.honey.abi,
      signer
    )
    const allowanceHoneyTx = await honeyContract.allowance(wallet, contracts.borrow.address)
    response = { ...response, honeyBorrowAllowance: allowanceHoneyTx._hex / Math.pow(10, 18)}

    setBorrowInfoState(response)
  }
  return (
    <InfoContext.Provider
      value={{
        ammInfo: ammInfoState,
        stakeInfo: stakeInfoState,
        borrowInfo: borrowInfoState,
        getAmmInfo,
        refreshAmmInfo,
        getStakeInfo,
        refreshStakeInfo,
        getBorrowInfo,
        refreshBorrowInfo
      }}
    >
      { children }
    </InfoContext.Provider>
  )
}

export const useInfo = () => useContext(InfoContext)