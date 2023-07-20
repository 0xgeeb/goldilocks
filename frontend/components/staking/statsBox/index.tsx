"use client"

import { useEffect } from "react"
import { 
  useStaking, 
  useWallet,
  useNotification
} from "../../../providers"
import { useStakingTx } from "../../../hooks/staking"

export const StatsBox = () => {

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

  const fetchInfo = async () => {
    await refreshStakingInfo()
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  const test = () => {
    console.log(stakingInfo)
  }

  const handleClaimClick = async () => {
    const button = document.getElementById('claim-button')

    if(!isConnected) {
      return
    }

    if(network !== "Avalanche Fuji C-Chain") {
      button && (button.innerHTML = "switch to devnet plz")
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
  
  return (
    <div className="flex flex-col w-[40%] h-[100%] mt-4 ml-4" onClick={() => test()}>
      <div className="w-[100%] h-[70%] flex p-6 flex-col bg-white rounded-xl border-2 border-black">
        <div className="flex flex-row justify-between items-center mt-3">
          <h1 className="font-acme text-[24px]">$LOCKS floor price:</h1>
          <p className="font-acme text-[20px]">${(stakingInfo.fsl / stakingInfo.supply) > 0 ? (stakingInfo.fsl / stakingInfo.supply).toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3">
          <h1 className="font-acme text-[24px]">$LOCKS balance:</h1>
          <p className="font-acme text-[20px]">{balance.locks > 0 ? balance.locks.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3">
          <h1 className="font-acme text-[24px]">$HONEY balance:</h1>
          <p className="font-acme text-[20px]">{balance.honey > 0 ? balance.honey.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3">
          <h1 className="font-acme text-[24px]">staked $LOCKS:</h1>
          <p className="font-acme text-[20px]">{stakingInfo.staked > 0 ? stakingInfo.staked.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3">
          <h1 className="font-acme text-[24px]">$PRG balance:</h1>
          <p className="font-acme text-[20px]">{balance.prg > 0 ? balance.prg.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
        </div>
        <div className="flex flex-row justify-between items-center mt-3">
          <h1 className="font-acme text-[24px]">$PRG available to claim:</h1>
          <p className="font-acme text-[20px]">{stakingInfo.yieldToClaim > 0 ? stakingInfo.yieldToClaim.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '0'}</p>
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