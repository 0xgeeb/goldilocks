import { createContext, PropsWithChildren, useContext, useState } from "react";
import { useContractReads } from "wagmi"
import { Signer, ethers } from "ethers"
import { useWallet } from "../../providers"
import { contracts } from "../../utils"

const INITIAL_STATE = {
  ammInfo: {
    fsl: 0,
    psl: 0,
    supply: 0,
    targetRatio: 0,
    lastFloorRaise: 0,
    honeyAllowance: 0
  },
  getAmmInfo: async () => {},
  refreshAmmInfo: async (signer: any): Promise<any> => {},
}

const InfoContext = createContext(INITIAL_STATE)

export const InfoProvider = (props: PropsWithChildren<{}>) => {

  const { children } = props

  const { wallet } = useWallet()

  const [ammInfoState, setAmmInfoState] = useState(INITIAL_STATE.ammInfo)

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
      }
    ]
  })

  const getAmmInfo = async () => {
    if(!wallet) {
      return
    }
    if(info) {
      const [fsl, psl, supply, targetRatio, lastFloorRaise, honeyAllowance] = info as unknown as [number, number, number, number, number, number]
      let response = {
        fsl: fsl / Math.pow(10, 18),
        psl: psl / Math.pow(10, 18),
        supply: supply / Math.pow(10, 18),
        targetRatio: targetRatio / Math.pow(10, 18),
        lastFloorRaise: lastFloorRaise / Math.pow(10, 18),
        honeyAllowance: honeyAllowance / Math.pow(10, 18)
      }
      setAmmInfoState(response)
    }
  }

  const refreshAmmInfo = async (signer: Signer): Promise<any> => {
    if(!wallet) {
      return
    }
    let response = {
      fsl: 0,
      psl: 0,
      supply: 0,
      targetRatio: 0,
      lastFloorRaise: 0,
      honeyAllowance: 0
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
    response = { ...response, honeyAllowance: allowanceTx._hex / Math.pow(10, 18)}
    setAmmInfoState(response)
    return response
  }

  return (
    <InfoContext.Provider
      value={{
        ammInfo: ammInfoState,
        getAmmInfo,
        refreshAmmInfo
      }}
    >
      { children }
    </InfoContext.Provider>
  )
}

export const useInfo = () => useContext(InfoContext)