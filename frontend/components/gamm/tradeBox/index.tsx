"use client"

import { useState, useEffect } from "react"
import { useGammMath } from "../../../hooks/gamm"
import { useGamm, useWallet } from "../../../providers"
import { SlippagePopup, GammButton, PercentageButtons } from "../../gamm"

export const TradeBox = () => {

  const [balancesLoading, setBalancesLoading] = useState<boolean>(true)
  const [topAmountLoading, setTopAmountLoading] = useState<boolean>(false)
  const [bottomAmountLoading, setBottomAmountLoading] = useState<boolean>(false)
  
  const {
    gammInfo,
    simulateBuy,
    simulateSell,
    simulateRedeem,
    slippage,
    debouncedHoneyBuy,
    debouncedGettingHoney,
    setHoneyBuy,
    redeemingLocks,
    redeemingHoney,
    setGettingHoney,
    setRedeemingHoney,
    setRedeemingLocks,
    displayString,
    bottomDisplayString,
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
    handleTopBalance, 
    handleTopChange,
    flipTokens,
    handleBottomBalance,
    handleBottomChange,
    changeNewInfo,
    findLocksBuyAmount,
    findLocksSellAmount
  } = useGamm()

  const { isConnected, refreshBalances } = useWallet()

  const { 
    floorPrice,
    marketPrice,
    simulateBuyDry,
    simulateSellDry
  } = useGammMath()

  useEffect(() => {
    refreshBalances()
    setBalancesLoading(false)
  }, [isConnected])

  const resetInfo = () => {
    changeNewInfo(
      gammInfo.fsl, 
      gammInfo.psl,
      floorPrice(gammInfo.fsl, gammInfo.supply), 
      marketPrice(gammInfo.fsl, gammInfo.psl, gammInfo.supply), 
      gammInfo.supply,
      gammInfo.targetRatio,
      gammInfo.lastFloorRaise
    )
    setDisplayString('')
    setBottomDisplayString('')
    setHoneyBuy(0)
    setBuyingLocks(0)
    setSellingLocks(0)
    setGettingHoney(0)
    setRedeemingLocks(0)
    setRedeemingHoney(0)
    setTopAmountLoading(false)
    setBottomAmountLoading(false)
  }

  const loadingElement = () => {
    return <span className="loader ml-6"></span>
  }

  const loadedLocks = async (dhb: number) => {
    setBottomAmountLoading(true)
    setTimeout(() => {
      const locksAmount: number = findLocksBuyAmount(dhb)
      simulateBuy(locksAmount)
      setBottomAmountLoading(false)
    }, 500)
  }

  useEffect(() => {
    if(activeToggle === 'buy') {
      if(debouncedHoneyBuy > 0) {
        loadedLocks(debouncedHoneyBuy)
      }
    }
    else if(activeToggle === 'sell') {
      setGettingHoney(simulateSellDry(sellingLocks, gammInfo.fsl, gammInfo.psl, gammInfo.supply) * (1 - (slippage.amount / 100)))
      setBottomDisplayString((simulateSellDry(sellingLocks, gammInfo.fsl, gammInfo.psl, gammInfo.supply) * (1 - (slippage.amount / 100))).toFixed(4))
    }
  }, [slippage.amount])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(!debouncedHoneyBuy) {
        resetInfo()
      }
      else {
        setTopInputFlag(true)
        loadedLocks(debouncedHoneyBuy)
      }
    }
  }, [debouncedHoneyBuy])

  useEffect(() => {
    if(!topInputFlag) {
      const locksWithSlippage: number = buyingLocks * (1 + (slippage.amount / 100))
      if(!buyingLocks) {
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
      if(!sellingLocks) {
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
      if(!debouncedGettingHoney) {
        resetInfo()
      }
      else {
        setBottomInputFlag(true)
        setTopAmountLoading(true)
        setTimeout(() => {
          const locksAmountWithSlippage: number = findLocksSellAmount(debouncedGettingHoney) * (1 + (slippage.amount / 100))
          const locksAmount: number = locksAmountWithSlippage
          !slippage.toggle && setDisplayString(locksAmount.toFixed(4))
          !slippage.toggle && setSellingLocks(locksAmount)
          simulateSell(locksAmount)
          setTopAmountLoading(false)
        }, 500)
      }
    }
  }, [debouncedGettingHoney])

  useEffect(() => {
    if(!bottomInputFlag) {
      if(!redeemingLocks) {
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
      if(!redeemingHoney) {
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

  const renderTokenImage = (token: string): string => {
    if(activeToggle === "buy") {
      if(token === "top") {
        return "/honey_logo.png"
      }
      else {
        return "/locks_logo.png"
      }
    }
    else if(activeToggle === "sell") {
      if(token === "top") {
        return "/locks_logo.png"
      }
      else {
        return "/honey_logo.png"
      }
    }
    else {
      if(token === "top") {
        return "/locks_logo.png"
      }
      else {
        return "/honey_logo.png"
      }
    }
  }

  const renderTokenLabel = (token: string): string => {
    if(activeToggle === "buy") {
      if(token === "top") {
        return "$honey"
      }
      else {
        return "$locks"
      }
    }
    else if(activeToggle === "sell") {
      if(token === "top") {
        return "$locks"
      }
      else {
        return "$honey"
      }
    }
    else {
      if(token === "top") {
        return "$locks"
      }
      else {
        return "$honey"
      }
    }
  }

  return (
    <div className="h-[65%] relative mt-2 2xl:mt-4 flex flex-col">
      <div className="h-[69%] px-6">
        <SlippagePopup />
        <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
          <div className="h-[50%] flex flex-row items-center justify-between">
            <div className="rounded-[50px] m-3 2xl:m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">
              <img 
                className="w-[20px] h-[20px] 2xl:w-[36px] 2xl:h-[36px]" 
                src={renderTokenImage("top")} 
                alt="lost"
              />
              <span className="font-acme text-[18px] 2xl:text-[25px] ml-2 2xl:ml-4">
                {renderTokenLabel("top")}
              </span>
            </div>
            <PercentageButtons />
          </div>
          <div className="h-[50%] pl-8 2xl:pl-10 flex flex-row items-center justify-between">
            {
              topAmountLoading ? 
              loadingElement() : 
              <input 
                className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[30px] 2xl:text-[40px]"
                type="number" 
                id="number-input" 
                placeholder="0.00" 
                value={displayString} 
                onChange={(e) => handleTopChange(e.target.value)} 
                autoFocus 
              />
            }
            <h1 className="mr-10 mt-4 text-[18px] 2xl:text-[23px] font-acme text-[#878d97]">
              balance: { balancesLoading ? loadingElement() : handleTopBalance() }
            </h1>
          </div>
        </div>
        <div 
          className="absolute top-[32%] left-[50%] h-10 w-10 bg-[#ffff00] border-2 border-black rounded-3xl flex justify-center items-center" 
          onClick={() => flipTokens()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0D111C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
        </div>
        <div className="rounded-3xl border-2 border-black mt-2 h-[50%] bg-white flex flex-col">
          <div className="h-[50%] flex flex-row items-center">
            <div className="rounded-[50px] m-3 2xl:m-6 p-2 flex flex-row bg-slate-100 border-2 border-black items-center">
              <img 
                className="w-[20px] h-[20px] 2xl:w-[36px] 2xl:h-[36px]" 
                src={renderTokenImage("bottom")} 
                alt="lost"
              />
              <span className="font-acme text-[18px] 2xl:text-[25px] ml-2 2xl:ml-4">
                {renderTokenLabel("bottom")}
              </span>
            </div>
          </div>
          <div className="h-[50%] pl-8 2xl:pl-10 flex flex-row items-center justify-between">
            {
              bottomAmountLoading ? 
              loadingElement() : 
              <input
                className="border-none focus:outline-none bg-transparent font-acme rounded-xl text-[30px] 2xl:text-[40px]" 
                type="number" 
                id="number-input" 
                placeholder="0.00" 
                value={bottomDisplayString} 
                onChange={(e) => handleBottomChange(e.target.value)} 
              />
            }
            <h1 className="mr-10 mt-4 text-[18px] 2xl:text-[23px] font-acme text-[#878d97]">
              balance: {balancesLoading ? loadingElement() : handleBottomBalance()}
            </h1>
          </div>
        </div> 
      </div>
      <GammButton />
    </div>
  )
}