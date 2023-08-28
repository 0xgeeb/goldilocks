"use client"

import { useState, useEffect } from "react"
import { 
  useStaking, 
  useWallet,
  useNotification
} from "../../../providers"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useStakingTx } from "../../../hooks/staking"

export const StatsBox = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const { 
    stakingInfo,
    refreshStakingInfo
  } = useStaking()

  const { 
    refreshBalances,
    balance
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

  const claimTxFlow = async (button: HTMLElement | null) => {
    if(balance.claimable == 0) {
      button && (button.innerHTML = "claim yield")
      return
    }
    button && (button.innerHTML = "claiming...")
    const claimTx = await sendClaimTx()
    claimTx && openNotification({
      title: 'Successfully Claimed $PRG!',
      hash: claimTx,
      direction: 'claimed',
      amount: balance.claimable,
      price: 0,
      page: 'claim'
    })
    button && (button.innerHTML = "claim yield")
    refreshBalances()
    refreshStakingInfo()
  }

  const handleClaimClick = async () => {
    const button = document.getElementById('claim-button')
    claimTxFlow(button)
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
    <div className="flex flex-col w-[40%] h-[100%] ml-4">
      <div className="w-[100%] h-[70%] flex p-3 2xl:p-6 flex-col justify-around bg-white rounded-xl border-2 border-black">
        <div className="flex flex-row justify-between items-center font-acme">
          <h1 className="text-[20px] 2xl:text-[24px]">$LOCKS floor price:</h1>
          <p className="text-[18px] 2xl:text-[20px]">${handleInfo(stakingInfo.fsl / stakingInfo.supply)}</p>
        </div>
        <div className="flex flex-row justify-between items-center font-acme">
          <h1 className="text-[20px] 2xl:text-[24px]">$LOCKS balance:</h1>
          <p className="text-[18px] 2xl:text-[20px]">{handleInfo(balance.locks)}</p>
        </div>
        <div className="flex flex-row justify-between items-center font-acme">
          <h1 className="text-[20px] 2xl:text-[24px]">$HONEY balance:</h1>
          <p className="text-[18px] 2xl:text-[20px]">{handleInfo(balance.honey)}</p>
        </div>
        <div className="flex flex-row justify-between items-center font-acme">
          <h1 className="text-[20px] 2xl:text-[24px]">$PRG balance:</h1>
          <p className="text-[18px] 2xl:text-[20px]">{handleInfo(balance.prg)}</p>
        </div>
        <div className="flex flex-row justify-between items-center font-acme">
          <h1 className="text-[20px] 2xl:text-[24px]">staked $LOCKS:</h1>
          <p className="text-[18px] 2xl:text-[20px]">{handleInfo(balance.staked)}</p>
        </div>
        <div className="flex flex-row justify-between items-center font-acme">
          <h1 className="text-[20px] 2xl:text-[24px]">$PRG available to claim:</h1>
          <p className="text-[18px] 2xl:text-[20px]">{handleInfo(balance.claimable)}</p>
        </div>
      </div>
      <div className="h-[10%] w-[65%] 2xl:w-[70%] mx-auto mt-4">
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openConnectModal,
            openChainModal
          }) => {
            return (
              <button 
                className="h-[100%] w-[100%] bg-white rounded-xl border-2 border-black font-acme text-[20px] 2xl:text-[25px]" 
                id="claim-button" 
                onClick={() => {
                  const button = document.getElementById('claim-button')
  
                  if(!account) {
                    if(button && button.innerHTML === "connect wallet") {
                      openConnectModal()
                    }
                    else {
                      button && (button.innerHTML = "connect wallet")
                    }
                  }
                  else if(chain?.name !== "Avalanche Fuji C-Chain") {
                    if(button && button.innerHTML === "switch to fuji plz") {
                      openChainModal()
                    }
                    else {
                      button && (button.innerHTML = "switch to fuji plz")
                    }
                  }
                  else {
                    handleClaimClick()
                  }
                }}
              >
                claim yield
              </button>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  )
}