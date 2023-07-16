"use client"

import { useState, useEffect } from "react"
import { 
  SlippagePopup,
  GammButton
} from "../../gamm"
import { 
  useLabel,
  useGammMath
} from "../../../hooks/gamm"
import { 
  useGamm, 
  useWallet 
} from "../../../providers"

export const TradeBox = () => {

  const [balancesLoading, setBalancesLoading] = useState<boolean>(false)
  const {
    gammInfo,
    simulateBuy,
    simulateSell,
    simulateRedeem,
    slippage,
    displayString,
    debouncedHoneyBuy,
    debouncedGettingHoney,
    honeyBuy,
    setHoneyBuy,
    redeemingLocks,
    redeemingHoney,
    setGettingHoney,
    setRedeemingHoney,
    setRedeemingLocks,
    setDisplayString,
    setBottomDisplayString,
    buyingLocks,
    setBuyingLocks,
    sellingLocks,
    setSellingLocks,
    setTopInputFlag,
    setBottomInputFlag,
    activeToggle,
    topInputFlag,
    bottomInputFlag,
    handlePercentageButtons, 
    handleTopBalance, 
    handleTopInput, 
    handleTopChange,
    flipTokens,
    handleBottomBalance,
    handleBottomChange,
    handleBottomInput,
    changeNewInfo,
    findLocksBuyAmount,
    findLocksSellAmount
  } = useGamm()
  const { 
    isConnected, 
    balance, 
    refreshBalances 
  } = useWallet()
  const { 
    floorPrice,
    marketPrice,
    simulateBuyDry,
    simulateSellDry
  } = useGammMath()

  useEffect(() => {
    setBalancesLoading(true)
    refreshBalances()
    setBalancesLoading(false)
  }, [isConnected])

  const test = () => {

  }

  const resetInfo = () => {
    changeNewInfo(gammInfo.fsl, gammInfo.psl, floorPrice(gammInfo.fsl, gammInfo.supply), marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply), gammInfo.supply)
    setDisplayString('')
    setBottomDisplayString('')
    setBuyingLocks(0)
    setHoneyBuy(0)
  }

  const loadingElement = () => {
    return <span className="loader"></span>
  }

  useEffect(() => {
    if(activeToggle === 'buy') {
      const locksAmount: number = findLocksBuyAmount(debouncedHoneyBuy)
      simulateBuy(locksAmount)
    }
    else if(activeToggle === 'sell') {
      setGettingHoney(simulateSellDry(sellingLocks, gammInfo.fsl, gammInfo.psl, gammInfo.supply) * (1 - (slippage.amount / 100)))
      setBottomDisplayString((simulateSellDry(sellingLocks, gammInfo.fsl, gammInfo.psl, gammInfo.supply) * (1 - (slippage.amount / 100))).toFixed(4))
    }
  }, [slippage.amount])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(!debouncedHoneyBuy || (isConnected && honeyBuy > balance.honey)) {
        resetInfo()
      }
      else {
        setTopInputFlag(true)
        const locksAmount: number = findLocksBuyAmount(debouncedHoneyBuy)
        simulateBuy(locksAmount)
      }
    }
  }, [debouncedHoneyBuy])

  useEffect(() => {
    if(!topInputFlag) {
      const locksWithSlippage: number = buyingLocks * (1 + (slippage.amount / 100))
      if(!buyingLocks || (isConnected && simulateBuyDry(locksWithSlippage, gammInfo.fsl, gammInfo.psl, gammInfo.supply) > balance.honey)) {
        resetInfo()
      }
      else {
        setBottomInputFlag(true)
        !slippage.toggle && setDisplayString(simulateBuyDry(locksWithSlippage, gammInfo.fsl, gammInfo.psl, gammInfo.supply).toFixed(4))
        !slippage.toggle && setHoneyBuy(simulateBuyDry(locksWithSlippage, gammInfo.fsl, gammInfo.psl, gammInfo.supply))
        simulateBuy(locksWithSlippage)
      }
    }
  }, [buyingLocks])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(!sellingLocks || (isConnected && sellingLocks > balance.locks)) {
        resetInfo()
      }
      else {
        setTopInputFlag(true)
        simulateSell(sellingLocks)
        setGettingHoney(simulateSellDry(sellingLocks, gammInfo.fsl, gammInfo.psl, gammInfo.supply) * (1 - (slippage.amount / 100)))
        setBottomDisplayString((simulateSellDry(sellingLocks, gammInfo.fsl, gammInfo.psl, gammInfo.supply) * (1 - (slippage.amount / 100))).toFixed(4))
      }
    }
  }, [sellingLocks])

  useEffect(() => {
    if(!topInputFlag) {
      const locksAmountWithSlippage: number = findLocksSellAmount(debouncedGettingHoney) * (1 + (slippage.amount / 100))
      if(!debouncedGettingHoney || (isConnected && locksAmountWithSlippage > balance.locks)) {
        resetInfo()
      }
      else {
        setBottomInputFlag(true)
        const locksAmount: number = locksAmountWithSlippage
        !slippage.toggle && setDisplayString(locksAmount.toFixed(4))
        !slippage.toggle && setSellingLocks(locksAmount)
        simulateSell(locksAmount)
      }
    }
  }, [debouncedGettingHoney])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(!redeemingLocks || (isConnected && redeemingLocks > balance.locks)) {
        resetInfo()
      }
      else {
        setTopInputFlag(true)
        simulateRedeem(redeemingLocks)
        setBottomDisplayString((redeemingLocks * floorPrice(gammInfo.fsl, gammInfo.supply)).toFixed(4))
        setRedeemingHoney(redeemingLocks * floorPrice(gammInfo.fsl, gammInfo.supply))
      }
    }
  }, [redeemingLocks])

  useEffect(() => {
    if(!topInputFlag) {
      if(!redeemingHoney || (isConnected && redeemingHoney / (gammInfo.fsl / gammInfo.supply) > balance.locks)) {
        resetInfo()
      }
      else {
        setBottomInputFlag(true)
        simulateRedeem(redeemingHoney / (gammInfo.fsl / gammInfo.supply))
        setDisplayString((redeemingHoney / (gammInfo.fsl / gammInfo.supply)).toFixed(4))
        setRedeemingLocks(redeemingHoney / (gammInfo.fsl / gammInfo.supply))
      }
    }
  }, [redeemingHoney])

  return (
    <div className="h-[75%] relative mt-4 flex flex-col" onClick={() => test()}>
      <div className="h-[67%] px-6">
        <SlippagePopup />
        <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
          <div className="h-[50%] flex flex-row items-center justify-between">
            <div className="rounded-[50px] m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(activeToggle, "topToken")}</div>
            <div className="flex flex-row items-center mr-10">
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(1)}>25%</button>
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(2)}>50%</button>
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(3)}>75%</button>
              <button className="ml-2 w-10 font-acme rounded-xl bg-slate-100 hover:bg-[#ffff00] border-2 border-black" onClick={() => handlePercentageButtons(4)}>MAX</button>
            </div>
          </div>
          <div className="h-[50%] pl-10 flex flex-row items-center justify-between">
            <input className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[40px]" placeholder="0.00" value={handleTopInput()} onChange={(e) => handleTopChange(e.target.value)} type="number" id="number-input" autoFocus />
            {/* todo: hide this and bottom one if not connected, have to debug hydration errors */}
            <h1 className="mr-10 mt-4 text-[23px] font-acme text-[#878d97]">balance: {balancesLoading ? loadingElement() : handleTopBalance()}</h1>
          </div>
        </div>
        <div className="absolute top-[31%] left-[50%] h-10 w-10 bg-[#ffff00] border-2 border-black rounded-3xl flex justify-center items-center" onClick={() => flipTokens()}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D111C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>
        <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
          <div className="h-[50%] flex flex-row items-center">
            <div className="rounded-[50px] m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">{useLabel(activeToggle, "bottomToken")}</div>
          </div>
          <div className="h-[50%] pl-10 flex flex-row items-center justify-between">
            <input className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[40px]" placeholder="0.00" value={handleBottomInput()} onChange={(e) => handleBottomChange(e.target.value)} type="number" id="number-input" />
            <h1 className="mr-10 mt-4 text-[23px] font-acme text-[#878d97]">balance: {handleBottomBalance()}</h1>
          </div>
        </div> 
      </div>
      <GammButton />
    </div>
  )
}