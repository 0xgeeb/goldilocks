"use client"

import { useEffect, useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useGoldilend, useNotification } from "../../../providers"
import { useGoldilendTx } from "../../../hooks/goldilend"

export const StakeTab = () => {

  const [infoLoading, setInfoLoading] = useState<boolean>(true)

  const {
    lockDisplayString,
    stakeDisplayString,
    unstakeDisplayString,
    goldilendInfo,
    findStake,
    handleStakeChange,
    lock,
    stake,
    unstake,
    clearOutStakeInputs
  } = useGoldilend()

  const {
    checkLockAllowance,
    checkStakeAllowance,
    sendBeraApproveTx,
    sendgBeraApproveTx,
    sendLockTx,
    sendStakeTx,
    sendUnstakeTx,
    sendClaimTx
  } = useGoldilendTx()

  const { openNotification } = useNotification()

  useEffect(() => {
    findStake()
    setInfoLoading(false)
  }, [])

  const refreshInfo = () => {
    clearOutStakeInputs()
    findStake()
  }

  const formatAsString = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const loadingElement = () => {
    return <span className="loader-small mx-auto"></span>
  }

  const lockTxFlow = async () => {
    const button = document.getElementById('lock-button')
    if(lock == 0) {
      return
    }
    if(lock > goldilendInfo.bera) {
      button && (button.innerHTML = "insufficient balance")
      return
    }
    const sufficientAllowance = await checkLockAllowance(lock)
    if(sufficientAllowance) {
      button && (button.innerHTML = "locking...")
      const lockTx = await sendLockTx(lock)
      lockTx && openNotification({
        title: 'Successfully Locked $BERA!',
        hash: lockTx,
        direction: 'locked',
        amount: lock,
        price: 0,
        page: 'goldilend'
      })
      button && (button.innerHTML = "lock")
      refreshInfo()
    }
    else {
      button && (button.innerHTML = "approving...")
      await sendBeraApproveTx(lock)
      setTimeout(() => {
        button && (button.innerHTML = "lock")
      }, 10000)
    }
  }

  const stakeTxFlow = async () => {
    const button = document.getElementById('stake-button')
    if(stake == 0) {
      return
    }
    if(stake > goldilendInfo.gbera) {
      button && (button.innerHTML = "insufficient balance")
      return
    }
    const sufficientAllowance = await checkStakeAllowance(stake)
    if(sufficientAllowance) {
      button && (button.innerHTML = "staking...")
      const stakeTx = await sendStakeTx(stake)
      stakeTx && openNotification({
        title: 'Successfully Staked $gBERA!',
        hash: stakeTx,
        direction: 'staked',
        amount: stake,
        price: 0,
        page: 'goldilend-gbera'
      })
      button && (button.innerHTML = "stake")
      refreshInfo()
    }
    else {
      button && (button.innerHTML = "approving...")
      await sendgBeraApproveTx(stake)
      setTimeout(() => {
        button && (button.innerHTML = "stake")
      }, 10000)
    }
  }

  const unstakeTxFlow = async () => {
    const button = document.getElementById('unstake-button')
    if(unstake == 0) {
      return
    }
    if(unstake > goldilendInfo.staked) {
      button && (button.innerHTML = "insufficient balance")
      return
    }
    button && (button.innerHTML = "unstaking...")
    const unstakeTx = await sendUnstakeTx(unstake)
    unstakeTx && openNotification({
      title: 'Successfully Staked $gBERA!',
      hash: unstakeTx,
      direction: 'unstaked',
      amount: unstake,
      price: 0,
      page: 'goldilend-gbera'
    })
    button && (button.innerHTML = "unstake")
    refreshInfo()
  }

  const claimTxFlow = async () => {
    const button = document.getElementById('claim-button')
    button && (button.innerHTML = "claiming...")
    const claimTx = await sendClaimTx()
    claimTx && openNotification({
      title: 'Successfully Claimed $PRG!',
      hash: claimTx,
      direction: 'claimed',
      amount: 0,
      price: 0,
      page: 'goldilend-claim'
    })
    button && (button.innerHTML = "claim")
    refreshInfo()
  }
  
  const handleButtonClick = async (tab: string) => {
    if(tab === 'lock') {
      lockTxFlow()
    }
    if(tab === 'stake') {
      stakeTxFlow()
    }
    if(tab === 'unstake') {
      unstakeTxFlow()
    }
    if(tab === 'claim') {
      claimTxFlow()
    }
  }

  return (
    <div className="w-[100%] h-[95%] flex flex-row justify-between">
      <div className="h-[97.5%] mt-[2.5%] w-[67.5%] flex flex-col border-2 border-black rounded-xl bg-white font-acme">
        <div className="w-[100%] h-[25%] relative px-6 py-4">
          <h1 className="text-[22px]">lock $BERA</h1>
          <input
            className="w-[30%] border-none focus:outline-none text-[20px] pl-8 mt-4"
            value={lockDisplayString}
            onChange={(e) => handleStakeChange(e.target.value, 'lock')}
            placeholder="0.00"
            type="number"
            id="number-input"
          />
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              openChainModal
            }) => {
              return (
                <button 
                  className="absolute top-[50%] right-[10%] h-[35%] w-[25%] rounded-xl border-2 border-black font-acme hover:scale-110"
                  id="lock-button" 
                  onClick={() => {
                    const button = document.getElementById('lock-button')

                    if(!account) {
                      if(button && button.innerHTML === "connect wallet") {
                        openConnectModal()
                      }
                      else {
                        button && (button.innerHTML = "connect wallet")
                      }
                    }
                    else if(chain?.name !== "Goerli test network") {
                      if(button && button.innerHTML === "switch to goerli plz") {
                        openChainModal()
                      }
                      else {
                        button && (button.innerHTML = "switch to goerli plz")
                      }
                    }
                    else {
                      handleButtonClick('lock')
                    }
                  }}
                >
                  lock
                </button>
              )
            }}
          </ConnectButton.Custom>
        </div>
        <div className="w-[100%] h-[25%] relative px-6 py-4">
          <h1 className="text-[22px]">stake $gBERA</h1>
          <input
            className="w-[30%] border-none focus:outline-none text-[20px] pl-8 mt-4"
            value={stakeDisplayString}
            onChange={(e) => handleStakeChange(e.target.value, 'stake')}
            placeholder="0.00"
            type="number"
            id="number-input"
          />
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              openChainModal
            }) => {
              return (
                <button 
                  className="absolute top-[50%] right-[10%] h-[35%] w-[25%] rounded-xl border-2 border-black font-acme hover:scale-110"
                  id="stake-button" 
                  onClick={() => {
                    const button = document.getElementById('stake-button')

                    if(!account) {
                      if(button && button.innerHTML === "connect wallet") {
                        openConnectModal()
                      }
                      else {
                        button && (button.innerHTML = "connect wallet")
                      }
                    }
                    else if(chain?.name !== "Goerli test network") {
                      if(button && button.innerHTML === "switch to goerli plz") {
                        openChainModal()
                      }
                      else {
                        button && (button.innerHTML = "switch to goerli plz")
                      }
                    }
                    else {
                      handleButtonClick('stake')
                    }
                  }}
                >
                  stake
                </button>
              )
            }}
          </ConnectButton.Custom>
        </div>
        <div className="w-[100%] h-[25%] relative px-6 py-4">
          <h1 className="text-[22px]">unstake $gBERA</h1>
          <input
            className="w-[30%] border-none focus:outline-none text-[20px] pl-8 mt-4"
            value={unstakeDisplayString}
            onChange={(e) => handleStakeChange(e.target.value, 'unstake')}
            placeholder="0.00"
            type="number"
            id="number-input"
          />
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              openChainModal
            }) => {
              return (
                <button 
                  className="absolute top-[50%] right-[10%] h-[35%] w-[25%] rounded-xl border-2 border-black font-acme hover:scale-110"
                  id="unstake-button" 
                  onClick={() => {
                    const button = document.getElementById('unstake-button')

                    if(!account) {
                      if(button && button.innerHTML === "connect wallet") {
                        openConnectModal()
                      }
                      else {
                        button && (button.innerHTML = "connect wallet")
                      }
                    }
                    else if(chain?.name !== "Goerli test network") {
                      if(button && button.innerHTML === "switch to goerli plz") {
                        openChainModal()
                      }
                      else {
                        button && (button.innerHTML = "switch to goerli plz")
                      }
                    }
                    else {
                      handleButtonClick('unstake')
                    }
                  }}
                >
                  unstake
                </button>
              )
            }}
          </ConnectButton.Custom>
        </div>
        <div className="w-[100%] h-[25%] relative px-6 py-4">
          <h1 className="text-[22px]">claim $PRG</h1>
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openConnectModal,
              openChainModal
            }) => {
              return (
                <button 
                  className="absolute top-[50%] right-[10%] h-[35%] w-[25%] rounded-xl border-2 border-black font-acme hover:scale-110"
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
                    else if(chain?.name !== "Goerli test network") {
                      if(button && button.innerHTML === "switch to goerli plz") {
                        openChainModal()
                      }
                      else {
                        button && (button.innerHTML = "switch to goerli plz")
                      }
                    }
                    else {
                      handleButtonClick('claim')
                    }
                  }}
                >
                  claim
                </button>
              )
            }}
          </ConnectButton.Custom>
        </div>
      </div>
      <div className="h-[97.5%] mt-[2.5%] w-[30%] flex flex-col px-2 justify-around border-2 border-black rounded-xl bg-white font-acme">
        {
          infoLoading ? loadingElement() :
          <>
            <div className="w-[100%] flex flex-row justify-between items-center">
              <h1 className="text-[22px]">bera:</h1>
              <h1 className="text-[20px]">{formatAsString(goldilendInfo.bera)}</h1>
            </div>
            <div className="w-[100%] flex flex-row justify-between items-center">
              <h1 className="text-[22px]">gbera:</h1>
              <h1 className="text-[20px]">{formatAsString(goldilendInfo.gbera)}</h1>
            </div>
            <div className="w-[100%] flex flex-row justify-between items-center">
              <h1 className="text-[22px]">staked gbera:</h1>
              <h1 className="text-[20px]">{formatAsString(goldilendInfo.staked)}</h1>
            </div>
            <div className="w-[100%] flex flex-row justify-between items-center">
              <h1 className="text-[22px]">claimable prg:</h1>
              <h1 className="text-[20px]">{formatAsString(goldilendInfo.claimable)}</h1>
            </div>
          </>
        }
      </div>
    </div>
  )
}