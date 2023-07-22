"use client"

import { useState, useEffect } from "react"
import { 
  useStaking, 
  useWallet,
  useNotification
} from "../../../providers"
import { useStakingTx } from "../../../hooks/staking"

export const StatsBox = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const { 
    stakingInfo,
    refreshStakingInfo
  } = useStaking()

  const { 
    isConnected,
    refreshBalances,
    balance,
    network
  } = useWallet()

  const { sendClaimTx } = useStakingTx()

  const { openNotification } = useNotification()

  useEffect(() => {
    refreshStakingInfo()
    setInfoLoading(false)
  }, [])

  const loadingElement = () => {
    return <span className="loader-small ml-3"></span>
  }

  const formatAsString = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const test = () => {
    console.log(stakingInfo)
  }

  const handleClaimClick = async () => {
    const button = document.getElementById('claim-button')

    if(!isConnected) {
      return
    }

    if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to fuji plz")
    }
    else {
      button && (button.innerHTML = "claiming...")
      const claimTx = await sendClaimTx()
      claimTx && openNotification({
        title: 'Successfully Claimed $PRG!',
        hash: claimTx,
        direction: 'claimed',
        amount: stakingInfo.yieldToClaim,
        price: 0,
        page: 'claim'
      })
      button && (button.innerHTML = "claim yield")
      refreshBalances()
      refreshStakingInfo()
    }
  }

  const handleInfo = (num: number) => {
    if(infoLoading) {
      return loadingElement()
    }
    else if(num > 0) {
      return formatAsString(num)
    }
    else {
      return "-"
    }
  }
  
  return (
    <div className="flex flex-col w-[40%] h-[100%] mt-4 ml-4" onClick={() => test()}>
      <div className="w-[100%] h-[70%] flex p-6 flex-col bg-white rounded-xl border-2 border-black">
        <div className="flex flex-row justify-between items-center mt-3 font-acme">
          <h1 className="text-[24px]">$LOCKS balance:</h1>
          <p className="text-[20px]">{handleInfo(balance.locks)}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3 font-acme">
          <h1 className="text-[24px]">$PRG balance:</h1>
          <p className="text-[20px]">{handleInfo(balance.prg)}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3 font-acme">
          <h1 className="text-[24px]">$HONEY balance:</h1>
          <p className="text-[20px]">{handleInfo(balance.honey)}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3 font-acme">
          <h1 className="text-[24px]">staked $LOCKS:</h1>
          <p className="text-[20px]">{handleInfo(stakingInfo.staked)}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3 font-acme">
          <h1 className="text-[24px]">$LOCKS floor price:</h1>
          <p className="text-[20px]">${handleInfo(stakingInfo.fsl / stakingInfo.supply)}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3 font-acme">
          <h1 className="text-[24px]">$PRG available to claim:</h1>
          <p className="text-[20px]">{handleInfo(stakingInfo.yieldToClaim)}</p>
        </div>
      </div>
      <div className="h-[10%] w-[70%] mx-auto mt-4">
        <button 
          className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[25px]" 
          id="claim-button" 
          onClick={() => handleClaimClick()}
        >
          claim yield
        </button>
      </div>
    </div>
  )
}