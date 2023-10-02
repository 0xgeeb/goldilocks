"use client"

import { useState, useEffect } from "react"
import { StakingButton, PercentageButtons } from "../../staking"
import { useWallet, useStaking } from "../../../providers"

export const StakeBox = () => {

  const [balanceLoading, setBalanceLoading] = useState<boolean>(true)

  const {
    renderLabel,
    handleBalance,
    handleChange,
    displayString
  } = useStaking()

  const {
    isConnected,
    refreshBalances
  } = useWallet()

  const loadingElement = () => {
    return <span className="loader ml-6"></span>
  }

  useEffect(() => {
    refreshBalances()
    setBalanceLoading(false)
  }, [isConnected])

  return (
    <div className="w-[60%] flex flex-col">
      <div className="rounded-3xl border-2 border-black w-[100%] h-[60%] bg-white flex flex-col relative">
        <div className="flex flex-row items-center justify-between ml-8 2xl:ml-10 mt-10 2xl:mt-16">
          <h1 className="font-acme text-[34px] 2xl:text-[40px]">{renderLabel()}</h1>
          <PercentageButtons />
        </div>
        <div className="absolute top-[45%]">
          <input 
            className="border-none focus:outline-none font-acme rounded-xl text-[34px] 2xl:text-[40px] pl-8 2xl:pl-10" 
            placeholder="0.00" 
            type="number" 
            value={displayString}
            onChange={(e) => handleChange(e.target.value)} 
            id="number-input" 
            autoFocus 
          />
        </div>
        <div className="absolute right-0 bottom-[35%]">
          <h1 
            className="text-[18px] 2xl:text-[23px] mr-4 2xl:mr-6 font-acme text-[#878d97]"
          >
            balance: {balanceLoading ? loadingElement() : handleBalance()}
          </h1>
        </div>
      </div>
      <StakingButton />
    </div>
  )
}